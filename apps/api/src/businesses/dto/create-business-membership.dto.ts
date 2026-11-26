import { IsEmail, IsIn } from 'class-validator';
import { BUSINESS_MEMBER_ROLES, BusinessMemberRole } from '../../authorization/access-control.service.js';

export class CreateBusinessMembershipDto {
  @IsEmail()
  email: string;

  @IsIn(BUSINESS_MEMBER_ROLES)
  role: BusinessMemberRole;
}