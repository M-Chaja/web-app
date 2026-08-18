// Real photo assets ported from the native asset catalogs (see
// m-chaja ios/MChaja/Assets.xcassets/Location*.imageset and Cabinet*.imageset)
// — copied into public/stations and public/cabinets. Keys match the
// `locationImageName` values already in the seed data (mockApi.ts).
import type { CabinetType } from "./models";

const stationPhotos: Record<string, string> = {
  slipway_waterfront: "/stations/slipway_waterfront.jpg",
  mlimani_city: "/stations/mlimani_city.jpg",
  kariakoo: "/stations/kariakoo.jpg",
  coco_beach: "/stations/coco_beach.jpg",
};

export function stationPhotoSrc(locationImageName: string): string | undefined {
  return stationPhotos[locationImageName];
}

export function cabinetPhotoSrc(cabinetType: CabinetType): string {
  return cabinetType === "small" ? "/cabinets/cabinet-small.png" : "/cabinets/cabinet-big.png";
}
