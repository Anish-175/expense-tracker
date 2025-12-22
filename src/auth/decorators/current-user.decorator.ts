import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUserPayload } from 'src/common/interface/current-user.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user; // user is added to request by Passport's JWT strategy
  },
);
