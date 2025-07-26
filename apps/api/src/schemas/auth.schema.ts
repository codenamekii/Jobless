// apps/api/src/schemas/auth.schema.ts
export const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    }
  }
};

export const registerSchema = {
  type: 'object',
  required: ['email', 'password', 'fullName'],
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    },
    fullName: {
      type: 'string',
      minLength: 2
    }
  }
};

export const refreshTokenSchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: {
      type: 'string'
    }
  }
};

export const forgotPasswordSchema = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email'
    }
  }
};

export const resetPasswordSchema = {
  type: 'object',
  required: ['token', 'password'],
  properties: {
    token: {
      type: 'string'
    },
    password: {
      type: 'string',
      minLength: 6
    }
  }
};

export const changePasswordSchema = {
  type: 'object',
  required: ['currentPassword', 'newPassword'],
  properties: {
    currentPassword: {
      type: 'string'
    },
    newPassword: {
      type: 'string',
      minLength: 6
    }
  }
};