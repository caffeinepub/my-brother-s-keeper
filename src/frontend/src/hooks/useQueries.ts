import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PlaceCategory, type Place, type Route, type UserProfile, UserRole, ExternalBlob } from '../backend';
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

    return useQuery<UserRole>({
        queryKey: ['currentUserRole'],
        queryFn: async () => {
            if (!actor) return UserRole.guest;
            return actor.getCallerUserRole();
        },
        enabled: !!actor && !actorFetching
    });
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

export function useGetUserProfile(userPrincipal: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<UserProfile | null>({
        queryKey: ['userProfile', userPrincipal],
        queryFn: async () => {
            if (!actor || !userPrincipal) return null;
            return actor.getUserProfile(Principal.fromText(userPrincipal));
        },
        enabled: !!actor && !actorFetching && !!userPrincipal
    });
}

export function useReviewVerification() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ user, approved }: { user: string; approved: boolean }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.reviewVerification(Principal.fromText(user), approved);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
        }
    });
}

// Admin Queries
export function useGetAllUserProfiles() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Array<[Principal, UserProfile]>>({
        queryKey: ['allUserProfiles'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getAllUserProfiles();
        },
        enabled: !!actor && !actorFetching
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
        mutationFn: async (place: { name: string; category: PlaceCategory; description: string; location: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.addPlace(place.name, place.category, place.description, place.location);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['places'] });
        }
    });
}

// Routes Queries
export function useGetRoutes(userPrincipal: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery<Route[]>({
        queryKey: ['routes', userPrincipal],
        queryFn: async () => {
            if (!actor || !userPrincipal) return [];
            return actor.getRoutes(Principal.fromText(userPrincipal));
        },
        enabled: !!actor && !actorFetching && !!userPrincipal
    });
}

export function useCreateRoute() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (route: {
            start: string;
            destination: string;
            waypoints: string[];
            dateTime: bigint;
            notes: string | null;
        }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createRoute(route.start, route.destination, route.waypoints, route.dateTime, route.notes);
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
        mutationFn: async (profile: { nextOfKin: string; healthConditions: string; accessCode: string }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createOrUpdateEmergencyProfile(profile.nextOfKin, profile.healthConditions, profile.accessCode);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emergencyProfile'] });
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
            queryClient.invalidateQueries({ queryKey: ['sosSnapshot'] });
        }
    });
}

export function useEmergencyLookup(userPrincipal: string | null, accessCode: string | null) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['emergencyLookup', userPrincipal, accessCode],
        queryFn: async () => {
            if (!actor || !userPrincipal || !accessCode) return null;
            return actor.emergencyLookup(Principal.fromText(userPrincipal), accessCode);
        },
        enabled: !!actor && !actorFetching && !!userPrincipal && !!accessCode,
        retry: false
    });
}
