import { EventType } from '../backend';

export function getEventTypeLabel(eventType: EventType): string {
    switch (eventType) {
        case EventType.userRegistration:
            return 'User Registration';
        case EventType.verificationSubmitted:
            return 'Verification Submitted';
        case EventType.verificationReviewed:
            return 'Verification Reviewed';
        case EventType.placeAdded:
            return 'Place Added';
        case EventType.routeCreated:
            return 'Route Created';
        case EventType.emergencyProfileUpdated:
            return 'Emergency Profile Updated';
        case EventType.sosSnapshot:
            return 'SOS Snapshot';
        case EventType.meetupLocationShared:
            return 'Meetup Location Shared';
        case EventType.meetupLocationUpdated:
            return 'Meetup Location Updated';
        case EventType.adminAction:
            return 'Admin Action';
        default:
            return 'Unknown Event';
    }
}

export const eventTypeOptions = [
    { value: EventType.userRegistration, label: 'User Registration' },
    { value: EventType.verificationSubmitted, label: 'Verification Submitted' },
    { value: EventType.verificationReviewed, label: 'Verification Reviewed' },
    { value: EventType.placeAdded, label: 'Place Added' },
    { value: EventType.routeCreated, label: 'Route Created' },
    { value: EventType.emergencyProfileUpdated, label: 'Emergency Profile Updated' },
    { value: EventType.sosSnapshot, label: 'SOS Snapshot' },
    { value: EventType.meetupLocationShared, label: 'Meetup Location Shared' },
    { value: EventType.meetupLocationUpdated, label: 'Meetup Location Updated' },
    { value: EventType.adminAction, label: 'Admin Action' }
];
