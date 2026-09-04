import Facility from '../models/Facility.js';
import MedicalService from '../models/MedicalService.js';
import FacilityStatus from '../models/FacilityStatus.js';

/**
 * Intelligent Healthcare Recommendation & Ranking Engine
 * Evaluates care requests against facilities, services, and live operational status.
 */
export const rankFacilitiesForRequest = async (careRequest) => {
  const {
    department,
    serviceRequired,
    locationCity,
    urgency = 'Medium',
    preferredFacilityType = 'Any',
    maxBudget = 25000
  } = careRequest;

  // 1. Fetch matching active services and populate facility
  const query = {};
  if (department && department !== 'Other') {
    query.department = department;
  }
  query.isAvailable = true;

  const services = await MedicalService.find(query).populate('facility');

  // Also fetch all current facility operational statuses in one map
  const allStatuses = await FacilityStatus.find({});
  const statusMap = new Map();
  allStatuses.forEach(st => {
    statusMap.set(st.facility.toString(), st);
  });

  const candidates = [];

  for (const service of services) {
    const facility = service.facility;
    if (!facility) continue;

    // Filter by facility type if specified
    if (
      preferredFacilityType &&
      preferredFacilityType !== 'Any' &&
      facility.facilityType !== preferredFacilityType
    ) {
      continue;
    }

    const facilityId = facility._id.toString();
    const liveStatus = statusMap.get(facilityId);

    // Operational Status check:
    const currentStatus = liveStatus ? liveStatus.status : 'Available';
    const isClosedOrUnavailable = currentStatus === 'Closed' || currentStatus === 'Unavailable';

    // If urgency is Emergency, closed facilities must be skipped unless emergency is marked available
    if (isClosedOrUnavailable && (!liveStatus || !liveStatus.emergencyAvailable)) {
      // Do not recommend currently closed or unavailable facilities
      continue;
    }

    // --- SCORING SYSTEM (0 to 100 max) ---
    let serviceScore = 0;
    let statusScore = 0;
    let locationScore = 0;
    let urgencyScore = 0;
    let budgetScore = 0;
    const highlights = [];

    // 1. Service & Department Match (up to 30 pts)
    if (service.department.toLowerCase() === (department || '').toLowerCase()) {
      serviceScore += 20;
    }
    // Keyword match in service name or description
    const keywords = (serviceRequired || '').toLowerCase().split(' ').filter(w => w.length > 2);
    let keywordHits = 0;
    keywords.forEach(kw => {
      if (
        service.name.toLowerCase().includes(kw) ||
        (service.description && service.description.toLowerCase().includes(kw))
      ) {
        keywordHits++;
      }
    });
    if (keywordHits > 0) {
      serviceScore += Math.min(10, keywordHits * 5);
      highlights.push(`Specialized in "${service.name}"`);
    } else {
      serviceScore += 5;
    }

    // 2. Real-time Status & Availability (up to 30 pts)
    if (currentStatus === 'Available') {
      statusScore += 26;
      highlights.push('Facility currently Available with open slots');
      const waitTime = liveStatus ? liveStatus.currentWaitTimeMinutes : 15;
      if (waitTime <= 15) {
        statusScore += 4;
        highlights.push(`Minimal wait time (~${waitTime} mins)`);
      } else if (waitTime <= 30) {
        statusScore += 2;
      }
    } else if (currentStatus === 'Busy') {
      statusScore += 16;
      highlights.push('Currently Busy (expect moderate waiting)');
    } else {
      statusScore += 5;
    }

    // 3. Location / Proximity (up to 25 pts)
    const targetCity = (locationCity || '').trim().toLowerCase();
    const facilityCity = (facility.city || '').trim().toLowerCase();

    if (facilityCity === targetCity) {
      locationScore += 25;
      highlights.push(`Located directly in ${facility.city}`);
    } else if (facilityCity.includes(targetCity) || targetCity.includes(facilityCity)) {
      locationScore += 18;
      highlights.push(`Nearby area: ${facility.city}`);
    } else {
      locationScore += 8;
    }

    // 4. Urgency Matching (up to 15 pts)
    if (urgency === 'Emergency') {
      if (facility.emergency24x7 || (liveStatus && liveStatus.emergencyAvailable)) {
        urgencyScore += 15;
        highlights.push('24/7 Emergency Care Ready');
      } else {
        urgencyScore += 4;
      }
    } else if (urgency === 'High') {
      if (facility.emergency24x7) {
        urgencyScore += 14;
      } else {
        urgencyScore += 10;
      }
    } else {
      urgencyScore += 12;
    }

    // 5. Budget Compatibility (up to 10 pts)
    const fee = Number(service.fees) || 0;
    const budget = Number(maxBudget) || 25000;
    if (fee <= budget) {
      budgetScore += 10;
      highlights.push(`Fee LKR ${fee.toLocaleString()} fits comfortably within your LKR ${budget.toLocaleString()} budget`);
    } else if (fee <= budget * 1.15) {
      budgetScore += 5;
      highlights.push(`Fee LKR ${fee.toLocaleString()} is slightly above budget`);
    } else {
      budgetScore += 1;
    }

    // Rating boost (1 to 5 bonus points)
    const ratingBonus = Math.round((facility.rating || 4.5) - 3.5);

    // Compute composite score capped at 100
    const rawTotal = serviceScore + statusScore + locationScore + urgencyScore + budgetScore + ratingBonus;
    const finalScore = Math.min(100, Math.max(10, rawTotal));

    // Match label
    let matchQuality = 'Good Match';
    if (finalScore >= 88) matchQuality = 'Exceptional Match';
    else if (finalScore >= 75) matchQuality = 'Strong Match';
    else if (finalScore >= 60) matchQuality = 'Moderate Match';

    candidates.push({
      service: {
        _id: service._id,
        name: service.name,
        department: service.department,
        fees: service.fees,
        serviceType: service.serviceType,
        description: service.description
      },
      facility: {
        _id: facility._id,
        name: facility.name,
        facilityType: facility.facilityType,
        city: facility.city,
        address: facility.address,
        contactNumber: facility.contactNumber,
        email: facility.email,
        rating: facility.rating,
        emergency24x7: facility.emergency24x7,
        imageUrl: facility.imageUrl
      },
      liveStatus: liveStatus ? {
        status: liveStatus.status,
        currentWaitTimeMinutes: liveStatus.currentWaitTimeMinutes,
        operatingHours: liveStatus.operatingHours,
        notice: liveStatus.notice
      } : {
        status: 'Available',
        currentWaitTimeMinutes: 15,
        operatingHours: '24/7',
        notice: 'Operational'
      },
      matchScore: finalScore,
      matchQuality,
      scoreBreakdown: {
        serviceMatch: serviceScore,
        availability: statusScore,
        location: locationScore,
        urgency: urgencyScore,
        budget: budgetScore
      },
      highlights
    });
  }

  // Sort descending by matchScore
  candidates.sort((a, b) => b.matchScore - a.matchScore);

  return candidates.map((cand, index) => ({
    rank: index + 1,
    ...cand
  }));
};
