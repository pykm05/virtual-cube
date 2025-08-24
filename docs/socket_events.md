| Name | Description | Args | Emitter |
|-|-|-|-|
| player:Initialize | Requests a user to be created | (string) Player's username | Client |
| room:join_random | Request to enter matchmaking's queue || Client |
| room:join_rematch | Request to join a new game with the same opponent || Client |
| room:joined | Attempts to manually join a room | (string) The room id | Client |
| keyboard:input | Sends a cube move to the server | (string) Player's socket id<br>(string) The move's notation to string | Client |
| player:completed_solve | The player has finished their solve | (string) Player's socket id | Client |
| room:found | The client has joined a room | (string) The id of the room | Server |
| room:rematch_pending | A player wants or no longer wants to rematch) | (string) The id of the player that sent the event<br>(RematchInfo) Small structure that stores infos about the current state of the rematch request<br> (bool) Is the sender joining or leaving the queue | Server |
| game:start | The current game has started | (Player[]) A list of players currently in the game<br>(string) the game's generated scramble | Server |
| inspection:start | The current game is now in Inspection state || Server |
| player:completed_solve | A player has finished their solve | (Player) The player that triggered this event | Server |
| solve:in_progress | The player's timer has started || Server |
| game:complete | The game has ended || Server |
| player:initialized | The client's player:initialize request succeeded | |Server|
| join:invalid | Failed to join a room || Server |
| timer:update | The player's timer has changed |(number) The current time of the timer in secconds| Server |
