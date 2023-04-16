export const testspec = `openapi: 3.0.0
info:
    version: '0.0.1'
    title: 'abeona API'
    description: 'abeona API'
    contact: {}
servers:
    - url: 'https://api.abeona.app'
      description: 'abeona api server'
    - url: 'http://localhost:8012'
      description: 'abeona api development server'
tags:
    - name: auth

paths:
    /auth/login:
        post:
            description: 'login with username and password'
            operationId: login
            summary: 'user login'
            tags:
                - auth
            requestBody:
                $ref: '#/components/requestBodies/Login'
            responses:
                '200':
                    $ref: '#/components/responses/Token'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /auth/register:
        post:
            description: 'register a user, this route has a token parameter that ensures invitation before register'
            operationId: register
            summary: register user
            tags:
                - auth
            parameters:
                - $ref: '#/components/parameters/TokenFromEmail'
            requestBody:
                $ref: '#/components/requestBodies/Register'
            responses:
                '203':
                    $ref: '#/components/responses/Token'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /auth/logout:
        get:
            description: 'user logout'
            operationId: logout
            summary: 'user logout'
            tags:
                - auth
            responses:
                '200':
                    $ref: '#/components/responses/StatusMessage'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /auth/reset-password:
        post:
            description: 'request a password reset this sends a link to user email with reset token attached'
            operationId: reset_password
            summary: 'reset password'
            tags:
                - auth
            requestBody:
                $ref: '#/components/requestBodies/ResetRequest'
            responses:
                '200':
                    $ref: '#/components/responses/StatusMessage'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /auth/confirm-reset:
        post:
            description: 'confirm a password reset'
            operationId: confirm_reset
            summary: 'confirm password reset'
            tags:
                - auth
            parameters:
                - $ref: '#/components/parameters/TokenFromEmail'
            requestBody:
                $ref: '#/components/requestBodies/ResetConfirm'
            responses:
                '200':
                    $ref: '#/components/responses/Token'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /auth/verify:
        post:
            description: 'multifactor verification with email or phone'
            operationId: verify_user
            summary: 'verify email | phone'
            tags:
                - auth
            requestBody:
                # am reusing reset request since only email is needed
                # might change it later for phone number verification
                $ref: '#/components/requestBodies/ResetRequest'
            responses:
                '200':
                    $ref: '#/components/responses/StatusMessage'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'
    /auth/confirm-verify:
        get:
            description: 'email confirmation from user inbox link'
            operationId: confirm_verify
            summary: 'confirm verification'
            tags:
                - auth
            parameters:
                - $ref: '#/components/parameters/TokenFromEmail'
            responses:
                '200':
                    $ref: '#/components/responses/Token'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

components:
    parameters:
        TokenFromEmail:
            name: token
            in: query
            description: a token parameter usually sent with a link to user email. this is used in invitation, verification and tracking for marketing
            required: false
            schema:
                type: string
                example: 'ey78..jwttoken..isodiiu9090434'
    requestBodies:
        Login:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - email
                            - password
                        properties:
                            email:
                                description: user email
                                type: string
                                example: 'email@abeona.app'
                            password:
                                description: user password
                                type: string
                                example: 'abeona'

                    examples:
                        login_example:
                            summary: an example of login
                            value:
                                email: 'email@abeona.app'
                                password: 'password'

        Register:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - first name
                            - last name
                            - email
                            - password
                        properties:
                            first name:
                                description: first name
                                type: string
                                example: 'abeona'
                            last name:
                                description: last name
                                type: string
                                example: 'lname'
                            email:
                                description: email
                                type: string
                                example: 'email@abeona.app'
                            password:
                                description: password
                                type: string
                                example: 'password'

                    examples:
                        register_example:
                            summary: an example of login
                            value:
                                first name: 'cliff'
                                last name: 'manyara'
                                email: 'example@abeona.app'
                                password: 'password123'

        ResetRequest:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - email
                        properties:
                            email:
                                type: string
                                description: email to send reset token to
                                example: example@abeona.app

                    examples:
                        reset_request:
                            summary: example of reset request
                            value:
                                email: example@abeona.app

        ResetConfirm:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - password
                        properties:
                            password:
                                type: string
                                description: new password
                                example: supersecretpassword

                    examples:
                        reset_request:
                            summary: example of reset confirmation
                            value:
                                password: supersecretpassword

    responses:
        Token:
            description: authentication and refresh tokens
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            token:
                                type: string
                                description: 'success token'
                                example: 'token_'

                    examples:
                        auth_token:
                            summary: 'example of success token'
                            value:
                                token: 'token_'

        StatusMessage:
            description: a generic status message for successiful 200 operation
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            message:
                                type: string
                                description: 'success message'
                                example: 'logged out'

                    examples:
                        logged_out:
                            summary: 'example of success message'
                            value:
                                message: 'logged out'

        Error:
            description: an error occured, this is the main error object for 400-500 all http errors
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            message:
                                type: string
                                description: error message
                                example: invalid email or password
                            reason:
                                type: string
                                description: optional reason why this error happened
                                example: invalid email or password
                            code:
                                type: string
                                description: internal error descriptor code for error tracking
                                example: 'E0056'

                    examples:
                        error:
                            summary: an example of error
                            value:
                                message: invalid email or password
                                reason: invalid email or password
                                code: E780FD
`;
