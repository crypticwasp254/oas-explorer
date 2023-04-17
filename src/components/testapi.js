export const testspec = `# this is a test api
# upload your own specification to read documentation
openapi: 3.0.0
info:
    version: '1.0.0'
    title: 'cyxth API'
    description: 'cyxth rest API'
    contact: {}
servers:
    - url: 'https://beta.cyxth.com/app_id/api'
      description: 'development server'

tags:
    - name: users
    - name: channels
    - name: channel

paths:
    /users:
        post:
            description: 'create a user or users. send and array of Users returns the number of users created, will fail if any of the users supplied is already created'
            operationId: create_users
            summary: create users
            tags:
                - users
            requestBody:
                $ref: '#/components/requestBodies/NewUser'
            responses:
                '203':
                    $ref: '#/components/responses/StatusReport'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'
        get:
            description: get all users. this supports pagination and returns the first 50 users by default
            operationId: users
            summary: get users
            tags:
                - users
            parameters:
                - $ref: '#/components/parameters/StartingAfter'
                - $ref: '#/components/parameters/Limit'

            responses:
                '200':
                    $ref: '#/components/responses/Users'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

        delete:
            description: delete users by supplying user ids, returns the number of users deleted
            operationId: delete_users
            summary: delete users
            tags:
                - users
            requestBody:
                $ref: '#/components/requestBodies/IdArray'
            responses:
                '200':
                    $ref: '#/components/responses/StatusReport'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /users/moderate:
        post:
            description: moderate users, block users and give admin access
            operationId: moderate_users
            summary: moderate users
            tags:
                - users
            requestBody:
                $ref: '#/components/requestBodies/Moderate'
            responses:
                '200':
                    $ref: '#/components/responses/StatusReport'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /channels:
        post:
            description: create a channel or channels, to add initial members add a members array to any Channel object with user ids, they will be added asynchronously and automaticaly subscribed to the new channel and can optionaly receive a notification. the maximum number of channels that can be created at a time is 1000 with a maximum initial members of your max channel user setting.this operation is atomic and will fail if any of the channels already exist
            operationId: create_channel
            summary: create channels
            tags:
                - channels
            requestBody:
                $ref: '#/components/requestBodies/Channels'
            responses:
                '203':
                    $ref: '#/components/responses/StatusReport'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

        get:
            description: get all channels, returns first 50 users by default if the pagination query is not supplied
            operationId: channels
            summary: get channels
            tags:
                - channels
            parameters:
                - $ref: '#/components/parameters/StartingAfter'
                - $ref: '#/components/parameters/Limit'
            responses:
                '200':
                    $ref: '#/components/responses/Channels'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

        delete:
            description: delete channels
            operationId: delete_channels
            summary: delete channels
            tags:
                - channels
            requestBody:
                $ref: '#/components/requestBodies/IdArray'
            responses:
                '200':
                    $ref: '#/components/responses/StatusReport'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

        put:
            description: update a channel, a channel id must be supplied, all the other fields supplied will be updated
            operationId: update_channels
            summary: update channel
            tags:
                - channel
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/Channel'
                        examples:
                            channel:
                                summary: update channel example
                                value:
                                    id: breakout
                                    name: breakout
                                    logo: 'https://logos.lq.com/rerju8u384bu4'

            responses:
                '200':
                    description: users array.
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/Channel'
                            examples:
                                channel:
                                    summary: update channel example
                                    value:
                                        id: breakout
                                        name: breakout
                                        logo: 'https://logos.lq.com/rerju8u384bu4'

                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /channels/{id}/moderate:
        parameters:
            - name: id
              in: path
              description: channel id
              required: true
              schema:
                  type: string

        post:
            description: moderate users in a channel
            operationId: moderate_channel
            summary: moderate channel
            tags:
                - channel
            requestBody:
                $ref: '#/components/requestBodies/Moderate'
            responses:
                '203':
                    $ref: '#/components/responses/StatusReport'
                '400':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

    /channels/{id}/users:
        parameters:
            - name: id
              in: path
              description: channel id
              required: true
              schema:
                  type: string

        post:
            description: create a user or users in channel,
            operationId: add_users
            summary: add members
            tags:
                - channel

            requestBody:
                $ref: '#/components/requestBodies/IdArray'

            responses:
                '200':
                    $ref: '#/components/responses/StatusReport'
                '401':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'
        get:
            description: get all users in channel
            operationId: users_in_channel
            summary: get members
            tags:
                - channel
            parameters:
                - $ref: '#/components/parameters/StartingAfter'
                - $ref: '#/components/parameters/Limit'
            responses:
                '200':
                    $ref: '#/components/responses/Users'
                '401':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

        delete:
            description: delete users in channel
            operationId: delete_users_in_channel
            summary: remove members
            tags:
                - channel
            requestBody:
                $ref: '#/components/requestBodies/IdArray'
            responses:
                '200':
                    $ref: '#/components/responses/StatusReport'
                '401':
                    $ref: '#/components/responses/Error'
                '403':
                    $ref: '#/components/responses/Error'
                '500':
                    $ref: '#/components/responses/Error'

security:
    - BearerAuth: []
components:
    securitySchemes:
        BearerAuth:
            type: http
            scheme: bearer
    parameters:
        StartingAfter:
            name: starting after
            in: query
            description: the id to start fetching from
            required: false
            schema:
                type: string
                example: 'cyxid890i9sduisd9'
        Limit:
            name: limit
            in: query
            description: the number of results to get
            required: false
            schema:
                type: number
                example: 50

    requestBodies:
        NewUser:
            required: true
            content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: '#/components/schemas/User'
                    examples:
                        new_users:
                            summary: an example of new user
                            value:
                                - id: '00uid0'
                                  name: 'john doe'
                                  mode: 300
                                  metadata:
                                      avatar: 'https://avtr.com/xyxerixcid'

                                - id: '00uid0'
                                  name: 'john doe'
                                  mode: 300
                                  metadata:
                                      avatar: 'https://avtr.com/xyxerixcid'

        Moderate:
            required: true
            content:
                application/json:
                    schema:
                        type: object
                        required:
                            - mode
                            - ids
                        properties:
                            mode:
                                description: the new permissions
                                type: number
                                example: 600
                            ids:
                                description: the ids to moderate
                                type: array
                                items:
                                    type: string
                                example: ['uid0', 'uid1']
                    examples:
                        moderate:
                            summary: moderate example
                            value:
                                mode: 300
                                ids: ['cyx8', 'cyx7']
        IdArray:
            required: true
            content:
                application/json:
                    schema:
                        $ref: '#/components/schemas/Ids'
                    examples:
                        id_array:
                            summary: an example of an array of ids
                            value:
                                - idx98io090439d
                                - uisfjdfdjire0r
                                - wowcyxthiscool

        Channels:
            required: true
            content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: '#/components/schemas/Channel'
                    examples:
                        channels:
                            summary: an example of channels
                            value:
                                - id: breakout
                                  name: breakout
                                  logo: 'https://logos.lq.com/rerju8u384bu4'
                                - id: maze0984
                                  name: maze19

    schemas:
        Ids:
            type: array
            description: ids
            items:
                type: string

        User:
            type: object
            description: user
            required:
                - id
                - name

            properties:
                id:
                    type: string
                    description: 'unique user id'
                    example: 'user_id'
                name:
                    type: string
                    description: 'user name'
                    example: 'user_name'
                mode:
                    type: number
                    description: user access rights
                metadata:
                    type: object
                    description: user metadata
                    properties:
                        avatar:
                            type: string
                            description: optional user avatar
                            example: 'https://avatar.appid.com/user_avatar'

        Channel:
            type: object
            description: channel
            required:
                - id
                - name
            properties:
                id:
                    type: string
                    description: channel id
                    example: 'tchanel'
                name:
                    type: string
                    description: channel name
                    example: 'tcahnnal'
                logo:
                    type: string
                    description: channel logo
                    example: 'https://yoursite.com/somer_avater.png'

    responses:
        # status report
        StatusReport:
            description: a status report usually the number of entities (channels,users,..) affected after a successiful create,delete,update
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            status:
                                type: number
                                description: number of affected entities
                                example: 6

                    examples:
                        status_report:
                            summary: example with 6 affected entities
                            value:
                                status: 6
        # errors
        Error:
            description: generic error
            content:
                application/json:
                    schema:
                        type: object
                        properties:
                            message:
                                type: string
                            type:
                                type: string
                            code:
                                type: string
                    examples:
                        error_out:
                            summary: an error occured example
                            value:
                                message: 'an error occured'
                                type: 'error_type'
                                code: 'ERR_CODE'

        # responses
        Users:
            description: users array.
            content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: '#/components/schemas/User'
                    examples:
                        users:
                            summary: users example
                            value:
                                - id: oncyxth89
                                  name: cyx9
                                  mode: 300
                                  metadata:
                                      avatar: https://heloo.lq.com/avtr90

        Channels:
            description: channels array
            content:
                application/json:
                    schema:
                        type: array
                        items:
                            $ref: '#/components/schemas/Channel'
                    examples:
                        channels:
                            summary: an example of channels
                            value:
                                - id: breakout
                                  name: breakout
                                  logo: 'https://logos.lq.com/rerju8u384bu4'
                                - id: maze0984
                                  name: maze19

`;
