# Municipal routing boundary snapshot

`wb-municipal-boundaries.json` contains 57 West Bengal Urban Local Body polygons
from the West Bengal AMRUT GIS portal (https://nagargispariseva.wb.gov.in),
redistributed by Ram Seraph / DataMeet:
https://github.com/ramSeraph/indian_admin_boundaries/releases/tag/urban
Asset: WB_AMRUT_ULBs.geojsonl.7z, retrieved 2026-10-11.
Distributor license: CC0 1.0, with attribution requested to DataMeet and the
original government source. See:
https://github.com/ramSeraph/indianopenmaps/blob/main/DATA_LICENSE.md

Transformation: GeoJSONL to FeatureCollection; coordinates rounded to six decimal
places (about 0.1 m); source names and ULB codes retained; municipality names and
districts normalized against the existing WB list. No boundaries drawn by hand.

This is partial coverage, not all West Bengal. Kolkata is supplemented separately below.
The upstream snapshot does not establish a legal effective date. It needs periodic
review against current government boundaries. Points outside coverage, in overlaps,
or within max(20 m, device accuracy) of an edge remain unassigned for admin review.
We deliberately do not guess based on the closest office or reverse-geocoded text:
that can cross the Hooghly or another administrative boundary.

Kamarhati's official profile lists Dakshineswar police station and the Ganges as
its western boundary: https://kamarhatimunicipality.org/home/page_show/82/64
Regression locations: Dakshineswar interior 22.657,88.365 => Kamarhati;
reported saved point 22.65305981856205,88.34413075555244 => Bally.
Existing reports are not rewritten by this change; original coordinates remain
intact. Manually corrected new reports retain captured coordinates separately.

This assigns reports inside this app; it does not send complaints to an external
municipal office, and does not claim to be a verified directory of office entrances.

## Kolkata supplement — separate license

`kolkata-boundary.json` is a union (Shapely unary_union, no hand-drawn additions)
of DataMeet's 141 Kolkata wards. It supplies the older Kolkata footprint, not a
claim to cover later municipal extensions. Outside-footprint points remain for
review. Source retrieved 2026-10-11:
https://github.com/datameet/Municipal_Spatial_Data/blob/master/Kolkata/kolkata.geojson
Attribution: Kolkata Municipal Data, Pune chapter of DataMeet Trust, Bangalore;
shared by Justin via the DataMeet community. This derived geometry is distributed
under the source's Creative Commons Attribution-ShareAlike 2.5 India license:
https://creativecommons.org/licenses/by-sa/2.5/in/
Source notice: https://github.com/datameet/Municipal_Spatial_Data/blob/master/Kolkata/Readme.md
No license change is claimed for this derivative.
