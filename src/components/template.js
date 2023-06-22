export const getTemplate = (title = "apiTitle", version = "0.0.1") => {
    return `openapi: 3.0.0
info:
    version: ${version}
    title: ${title}
    description: your api description
    contact: {}
servers:
    - url: https://api.your.app.com
      description: production server
    - url: http://localhost:6996
      description: development server
tags:
    - name: hello
      description: just saying hi
paths:
    /hello:
        get:
            tags:
                - hello
            summary: say hello
            description: says hello to user, any user... all users
            operationId: say_hello
            parameters:
                - name: username
                  in: query
                  required: false
                  schema:
                    type: string
            responses:
                '200':
                    description: hello response
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    name:
                                        type: string
                                        description: the username you just sent, ...
                                        example: bob
                                    
                                    greeting:
                                        type: string
                                        description: a unique greeting for you
                                        example: supp!
    `
}