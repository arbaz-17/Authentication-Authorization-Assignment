import { useQuery } from "@tanstack/react-query";

import {systemService} from "@/features/system/system.service";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["system", "health"],
    queryFn: ({ signal }) => systemService.getHealth(signal),
  });
}