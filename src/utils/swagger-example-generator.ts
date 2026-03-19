export function swaggerSuccessResponseExample(data: any, example?: any) {
  return {
    properties: {
      data: {
        type: 'object',
        properties: data,
        example,
      },
    },
  };
}

export const SwaggerFailureResponseExample = (payload: {
  errorMessage: string;
  errorTarget?: string;
}) => {
  return {
    properties: {
      data: {
        type: 'object',
        example: {
          errorMessage: payload.errorMessage,
          errorTarget: payload.errorTarget,
        },
      },
    },
  };
};
