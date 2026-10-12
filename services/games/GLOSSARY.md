# Games

Gathers players behind a code and runs a game from its lobby to its end. It owns who is in each game, who hosts it and how the others see each player.

## Language

### People

**Player**: A person who has joined a game. _Avoid_: Participant, user

**Host**: The player who created the game. The host is a player like any other: they also estimate and vote. _Avoid_: Owner, admin, creator

**Nickname**: How the other players see a player in a game. _Avoid_: Username, alias, display name

### Playing together

**Game**: One play session that players join with its code, from the lobby to the end. Playing again is a new game, with a new code. _Avoid_: Match, session, room

**Lobby**: The phase of a game before it starts, while players join. It is a moment of the game, not a place. _Avoid_: Waiting room

**Code**: The short code players type to join a game. It identifies one game among the games still alive, and nobody can join with it once the game has started. _Avoid_: PIN, room code, game id
