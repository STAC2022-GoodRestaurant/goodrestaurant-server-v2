import * as wkx from "wkx";
import { Geometry } from "geojson";
import { ValueTransformer } from "typeorm/decorator/options/ValueTransformer";

export class GeometryTransformer implements ValueTransformer {
  to(geojson: Geometry): string {
    return wkx.Geometry.parseGeoJSON(geojson).toWkt();
  }

  from(wkb: string): Record<string, any> | undefined {
    if (!wkb) return;

    return wkx.Geometry.parse(wkb).toGeoJSON();
  }
}
