import { IsIn } from 'class-validator';
import { BUSINESS_MEMBER_ROLES, BusinessMemberRole } from '../../authorization/access-control.service.js';

export class UpdateBusinessMembershipDto {
  @IsIn(BUSINESS_MEMBER_ROLES)
  role: BusinessMemberRole;
}