import { Link } from "react-router-dom";
import regions from "../data/regions.json";
import type { Region } from "../types";

function RegionListPage() {
  const list = regions as Region[];

  return (
    <main>
      <h1>DSA Quest — World Map</h1>
      <ul>
        {list.map((region) => (
          <li key={region.id}>
            {region.available ? (
              <Link to={`/region/${region.id}`}>
                {region.order}. {region.name}
              </Link>
            ) : (
              <span aria-disabled="true">
                {region.order}. {region.name} (locked)
              </span>
            )}
            {" — "}
            {region.pattern}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default RegionListPage;
