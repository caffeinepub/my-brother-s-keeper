import { PlaceCategory } from '../backend';

export const placeCategoryLabels: Record<PlaceCategory, string> = {
    [PlaceCategory.hotel]: 'Hotel',
    [PlaceCategory.restaurant]: 'Restaurant',
    [PlaceCategory.shop]: 'Shop',
    [PlaceCategory.gasStation]: 'Gas Station',
    [PlaceCategory.mechanic]: 'Mechanic'
};

export const placeCategoryOptions = Object.entries(placeCategoryLabels).map(([value, label]) => ({
    value: value as PlaceCategory,
    label
}));

export function getCategoryLabel(category: PlaceCategory): string {
    return placeCategoryLabels[category] || category;
}
