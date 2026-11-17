declare module 'class-validator' {
  export function validateSync(object: unknown, validationOptions?: any): any[];
  export function validate(object: unknown, validationOptions?: any): Promise<any[]>;
  export const IsString: any;
  export const IsEmail: any;
  export const IsOptional: any;
  export const IsNotEmpty: any;
  export const IsNumber: any;
  export const IsUUID: any;
  export const MinLength: any;
  export const MaxLength: any;
  export const IsIn: any;
  export const IsPositive: any;
  export const IsInt: any;
  export const IsDateString: any;
  export const IsUrl: any;
  export const Matches: any;
  export const IsEnum: any;
  export const IsBoolean: any;
  export const IsObject: any;
  export const IsArray: any;
  export const Min: any;
  export const Max: any;
  export const Allow: any;
  export const ValidateNested: any;
  export const Type: any;
}
