import { WorkspaceitemSectionFormObject } from './workspaceitem-section-form.model';
import { WorkspaceitemSectionUploadFileObject } from './workspaceitem-section-upload-file.model';
import { WorkspaceitemSectionLicenseObject } from './workspaceitem-section-license.model';

export interface WorkspaceitemSectionsObject {
  [name: string]: WorkspaceitemSectionDataType;

}

export type WorkspaceitemSectionDataType
  = WorkspaceitemSectionFormObject
  | WorkspaceitemSectionUploadFileObject
  | WorkspaceitemSectionLicenseObject