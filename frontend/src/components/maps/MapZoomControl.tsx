import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMapZoomPreference, setMapZoomPreference, getZoomRange } from '../../lib/mapZoomPreference';
import { ZoomIn } from 'lucide-react';

export default function MapZoomControl() {
  const [zoom, setZoom] = useState<number>(getMapZoomPreference());
  const { min, max } = getZoomRange();

  useEffect(() => {
    // Load preference on mount
    setZoom(getMapZoomPreference());
  }, []);

  const handleZoomChange = (value: string) => {
    const newZoom = parseInt(value, 10);
    setZoom(newZoom);
    setMapZoomPreference(newZoom);
  };

  // Generate zoom options (common zoom levels)
  const zoomOptions = [10, 12, 14, 15, 16, 18, 20];

  return (
    <div className="space-y-2">
      <Label htmlFor="map-zoom" className="flex items-center gap-2 text-sm">
        <ZoomIn className="h-4 w-4" />
        Map Zoom Level
      </Label>
      <Select value={zoom.toString()} onValueChange={handleZoomChange}>
        <SelectTrigger id="map-zoom" className="w-full">
          <SelectValue placeholder="Select zoom level" />
        </SelectTrigger>
        <SelectContent>
          {zoomOptions.map((level) => (
            <SelectItem key={level} value={level.toString()}>
              {level} {level === 15 ? '(Default)' : level < 15 ? '(Zoomed out)' : '(Zoomed in)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Controls how zoomed in the map appears when you open Google Maps links
      </p>
    </div>
  );
}
