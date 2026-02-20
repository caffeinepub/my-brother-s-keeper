import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PlaceCategory, type Place, type Route, type UserProfile, UserRole, ExternalBlob, type MeetupLocation, type SOSSnapshot } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched
    };
}

export function useGetCallerUserRole() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserRole>({
        queryKey: ['currentUserRole'],
        queryFn: async () => {
            console.log('[useGetCallerUserRole] Fetching user role...');
            if (!actor) {
                console.log('[useGetCallerUserRole] No actor available, returning guest');
                return UserRole.guest;
            }
            try {
                const role = await actor.getCallerUserRole();
                console.log('[useGetCallerUserRole] Fetched role:', role);
                return role;
            } catch (error) {
                console.error('[useGetCallerUserRole] Error fetching role:', error);
                throw error;
            }
        },
        enabled: !!actor && !actorFetching,
        retry: false
    });

    console.log('[useGetCallerUserRole] Hook state:', {
        actorFetching,
        queryLoading: query.isLoading,
        queryFetching: query.isFetching,
        data: query.data,
        error: query.error
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched
    };
}

export function useCreateUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createUserProfile(name);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }
    });
}

export function useUploadVerification() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ licenseProof, idProof }: { licenseProof: ExternalBlob | null; idProof: ExternalBlob | null }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.uploadVerification(licenseProof, idProof);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }
    });
}

// Admin Queries
export function useGetAllUserProfiles() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<[Principal, UserProfile][]>({
        queryKey: ['allUserProfiles'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getAllUserProfiles();
        },
        enabled: !!actor && !actorFetching
    });
}

export function useGetUserProfile(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<UserProfile | null>({
        queryKey: ['userProfile', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getUserProfile(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}

export function useReviewVerification() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ user, approved }: { user: string; approved: boolean }) => {
            if (!actor) throw new Error('Actor not available');
            const principal = Principal.fromText(user.trim());
            return actor.reviewVerification(principal, approved);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        }
    });
}

export function useRequestAdminAccess() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.requestAdminAccess();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
        }
    });
}

// Places Queries
export function useSearchPlaces(category: PlaceCategory | null = null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Place[]>({
        queryKey: ['places', category],
        queryFn: async () => {
            if (!actor) return [];
            return actor.searchPlaces(category);
        },
        enabled: !!actor && !actorFetching
    });
}

export function useAddPlace() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, category, description, location }: { name: string; category: PlaceCategory; description: string; location: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.addPlace(name, category, description, location);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['places'] });
        }
    });
}

// Routes Queries
export function useGetRoutes(userPrincipalText: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Route[]>({
        queryKey: ['routes', userPrincipalText],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return [];
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.getRoutes(principal);
            } catch (error) {
                console.error('Invalid principal:', error);
                return [];
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText
    });
}

export function useCreateRoute() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ start, destination, waypoints, dateTime, notes }: { start: string; destination: string; waypoints: string[]; dateTime: bigint; notes: string | null }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createRoute(start, destination, waypoints, dateTime, notes);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routes'] });
        }
    });
}

// Emergency Profile Queries
export function useCreateOrUpdateEmergencyProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ nextOfKin, healthConditions, accessCode }: { nextOfKin: string; healthConditions: string; accessCode: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createOrUpdateEmergencyProfile(nextOfKin, healthConditions, accessCode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergencyLookup'] });
        }
    });
}

// SOS Queries
export function useCreateSOSSnapshot() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createSOSSnapshot(latitude, longitude);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergencyLookup'] });
            queryClient.invalidateQueries({ queryKey: ['allSOSLocations'] });
        }
    });
}

export function useEmergencyLookup(userPrincipalText: string | null, accessCode: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['emergencyLookup', userPrincipalText, accessCode],
        queryFn: async () => {
            if (!actor || !userPrincipalText || !accessCode) return null;
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                return actor.emergencyLookup(principal, accessCode);
            } catch (error) {
                console.error('Invalid principal:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText && !!accessCode,
        retry: false
    });
}

// Admin SOS Queries
export function useGetAllLatestSOSLocations() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<SOSSnapshot[]>({
        queryKey: ['allSOSLocations'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getAllLatestSOSLocations();
        },
        enabled: !!actor && !actorFetching
    });
}

// Meetup Location Queries
export function useShareMeetupLocation() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ latitude, longitude, name }: { latitude: number; longitude: number; name: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.shareMeetupLocation({ latitude, longitude, name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
        }
    });
}

export function useDeactivateMeetupLocation() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.deactivateMeetupLocation();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meetupLocation'] });
        }
    });
}

/**
 * Lookup a meetup location by Principal ID and validate against the provided share code.
 * The query key includes both the principal and the entered code to ensure fresh lookups.
 */
export function useGetLatestMeetupLocation(userPrincipalText: string | null, enteredCode: string) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<MeetupLocation | null>({
        queryKey: ['meetupLocation', userPrincipalText, enteredCode],
        queryFn: async () => {
            if (!actor || !userPrincipalText) return null;
            
            try {
                const principal = Principal.fromText(userPrincipalText.trim());
                const location = await actor.getLatestMeetupLocation(principal);
                
                // Validate the returned location against the entered code
                if (location && location.name === enteredCode.trim()) {
                    return location;
                }
                
                // Code mismatch or no location - return null
                return null;
            } catch (error) {
                console.error('Meetup lookup error:', error);
                return null;
            }
        },
        enabled: !!actor && !actorFetching && !!userPrincipalText && !!enteredCode,
        retry: false
    });
}
