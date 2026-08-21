export interface Neighborhood {
  name: string;
  lat: number;
  lng: number;
}

export const CITY_DATA: Record<string, Neighborhood[]> = {
  'الرياض': [
    { name: 'حي الملقى', lat: 24.8142, lng: 46.6111 },
    { name: 'حي حطين', lat: 24.7920, lng: 46.5970 },
    { name: 'حي القيروان', lat: 24.8210, lng: 46.5830 },
    { name: 'حي بنبان', lat: 24.8460, lng: 46.5610 },
    { name: 'حي العارض', lat: 24.8870, lng: 46.6270 },
    { name: 'حي الصحافة', lat: 24.8055, lng: 46.6375 },
    { name: 'حي الوادي', lat: 24.7930, lng: 46.6490 },
    { name: 'حي النفل', lat: 24.7860, lng: 46.6810 },
    { name: 'حي الياسمين', lat: 24.8217, lng: 46.6567 },
    { name: 'حي الربيع', lat: 24.7880, lng: 46.6830 },
    { name: 'حي الغدير', lat: 24.7740, lng: 46.6560 },
    { name: 'حي النرجس', lat: 24.8450, lng: 46.6800 },
    { name: 'حي المروج', lat: 24.7520, lng: 46.6580 },
    { name: 'حي الورود', lat: 24.7440, lng: 46.6750 },
    { name: 'حي الإزدهار', lat: 24.7680, lng: 46.6860 },
    { name: 'حي التعاون', lat: 24.7800, lng: 46.6290 },
    { name: 'حي النخيل', lat: 24.7450, lng: 46.6240 },
    { name: 'حي المصيف', lat: 24.7610, lng: 46.6280 },
    { name: 'حي الرحمانية', lat: 24.7330, lng: 46.6480 },
    { name: 'حي العليا', lat: 24.7136, lng: 46.6753 },
    { name: 'حي السليمانية', lat: 24.6940, lng: 46.6920 },
    { name: 'حي المعذر الشمالي', lat: 24.6540, lng: 46.6800 },
    { name: 'حي الملك عبدالعزيز', lat: 24.7010, lng: 46.7100 },
    { name: 'حي الملز', lat: 24.6680, lng: 46.7320 },
    { name: 'حي الروضة', lat: 24.7300, lng: 46.7700 },
    { name: 'حي الحمراء', lat: 24.7210, lng: 46.7540 },
    { name: 'حي غرناطة', lat: 24.7990, lng: 46.7770 },
    { name: 'حي قرطبة', lat: 24.7500, lng: 46.7960 },
    { name: 'حي اليرموك', lat: 24.8090, lng: 46.8050 },
    { name: 'حي الرمال', lat: 24.8510, lng: 46.8320 },
    { name: 'حي المونسية', lat: 24.7770, lng: 46.8260 },
    { name: 'حي القادسية', lat: 24.8020, lng: 46.8380 },
    { name: 'حي إشبيلية', lat: 24.7890, lng: 46.8420 },
    { name: 'حي عرقة', lat: 24.6940, lng: 46.5910 },
    { name: 'حي أم الحمام', lat: 24.6940, lng: 46.5540 },
    { name: 'حي لبن', lat: 24.6280, lng: 46.5450 },
    { name: 'حي ظهرة لبن', lat: 24.6220, lng: 46.5350 },
    { name: 'حي البديعة', lat: 24.6170, lng: 46.6310 },
    { name: 'حي السويدي', lat: 24.5960, lng: 46.6610 },
    { name: 'حي الشفا', lat: 24.5600, lng: 46.6660 },
    { name: 'حي بدر', lat: 24.5720, lng: 46.6970 },
    { name: 'حي العزيزية', lat: 24.5840, lng: 46.7570 },
    { name: 'حي الدار البيضاء', lat: 24.5450, lng: 46.7310 },
    { name: 'حي نمار', lat: 24.5860, lng: 46.5510 },
    { name: 'حي عريض', lat: 24.5750, lng: 46.6200 },
  ],
  'جدة': [
    { name: 'حي البلد', lat: 21.4833, lng: 39.1833 },
    { name: 'حي الحمراء', lat: 21.5282, lng: 39.1626 },
    { name: 'حي الشاطئ', lat: 21.6033, lng: 39.1166 },
    { name: 'حي الروضة', lat: 21.5732, lng: 39.1483 },
    { name: 'حي العزيزية', lat: 21.5499, lng: 39.1776 },
    { name: 'حي السلامة', lat: 21.5833, lng: 39.1500 },
    { name: 'حي المحيمدية', lat: 21.6167, lng: 39.1333 },
    { name: 'حي الفيصلية', lat: 21.5667, lng: 39.1833 },
    { name: 'حي أبحر الشمالية', lat: 21.7333, lng: 39.1167 },
    { name: 'حي المروة', lat: 21.6333, lng: 39.2000 },
  ],
  'الدمام': [
    { name: 'حي الشاطئ الشرقي', lat: 26.4731, lng: 50.1288 },
    { name: 'حي الريان', lat: 26.4180, lng: 50.1130 },
    { name: 'حي الفيصلية', lat: 26.3985, lng: 50.0760 },
    { name: 'حي الروضة', lat: 26.4420, lng: 50.0880 },
    { name: 'حي المزروعية', lat: 26.4520, lng: 50.1220 },
    { name: 'حي النور', lat: 26.4000, lng: 50.0333 },
    { name: 'حي الاتصالات', lat: 26.4167, lng: 50.0833 },
    { name: 'حي الزهور', lat: 26.4333, lng: 50.1167 },
    { name: 'حي الحمراء', lat: 26.4667, lng: 50.1000 },
    { name: 'حي المباركية', lat: 26.4500, lng: 50.1333 },
  ],
  'مكة المكرمة': [
    { name: 'حي أجياد', lat: 21.4179, lng: 39.8292 },
    { name: 'حي العزيزية', lat: 21.4166, lng: 39.8650 },
    { name: 'حي منى', lat: 21.4150, lng: 39.8930 },
    { name: 'حي المسفلة', lat: 21.4110, lng: 39.8230 },
    { name: 'حي الشبيكة', lat: 21.4210, lng: 39.8180 },
    { name: 'حي بطحاء قريش', lat: 21.3667, lng: 39.8333 },
    { name: 'حي الشرائع', lat: 21.4500, lng: 39.9500 },
    { name: 'حي النوارية', lat: 21.5500, lng: 39.7833 },
    { name: 'حي الرصيفة', lat: 21.4000, lng: 39.7833 },
    { name: 'حي الزايدي', lat: 21.3833, lng: 39.7333 },
  ],
  'المدينة المنورة': [
    { name: 'حي المنطقة المركزية', lat: 24.4686, lng: 39.6142 },
    { name: 'حي قباء', lat: 24.4392, lng: 39.6172 },
    { name: 'حي قربان', lat: 24.4536, lng: 39.6231 },
    { name: 'حي بضاعة', lat: 24.4727, lng: 39.6092 },
    { name: 'حي العيون', lat: 24.5200, lng: 39.5950 },
    { name: 'حي سيد الشهداء', lat: 24.4917, lng: 39.6125 },
    { name: 'حي العزيزية', lat: 24.4667, lng: 39.5333 },
    { name: 'حي الهجرة', lat: 24.4000, lng: 39.6167 },
    { name: 'حي الدويخلة', lat: 24.4833, lng: 39.6500 },
    { name: 'حي الخالدية', lat: 24.4500, lng: 39.6500 },
  ],
};

export const CITIES = Object.keys(CITY_DATA);

export const DEFAULT_CITY = 'الرياض';

export function getNeighborhoodCoordinates(city: string, neighborhood?: string): { lat: number; lng: number } {
  const neighborhoods = CITY_DATA[city] || CITY_DATA[DEFAULT_CITY];
  if (neighborhood) {
    const found = neighborhoods.find((n) => n.name === neighborhood);
    if (found) {
      return { lat: found.lat, lng: found.lng };
    }
  }
  if (neighborhoods && neighborhoods.length > 0) {
    return { lat: neighborhoods[0].lat, lng: neighborhoods[0].lng };
  }
  return { lat: 24.7136, lng: 46.6753 };
}
