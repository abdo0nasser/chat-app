import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsGoodUsername(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'is good username',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string): boolean {
          const regex: RegExp = /^[a-zA-Z0-9]{3,20}$/;
          return regex.test(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `username must be between 3 and 20 character and have only alphanumeric characters`;
        },
      },
    });
  };
}
