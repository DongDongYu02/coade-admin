import { request } from "@/config/axios";
import type { ApiResult } from "@/config/axios/config";

export function getDeptSelectionApi(): Promise<ApiResult<CmtDeptSelectionVO[]>> {
  return request.get("/cmt/dept/selection");
}

export interface CmtDeptSelectionVO {
  id: string;
  text: string;
}
