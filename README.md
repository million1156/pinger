# Cosmic pinger

This is a quick bot I wrote up in like an hour that pings either @here or a configurable "active ping" - it's for a server I work for

## Why use role checks instead of Discord permissions?
In our enviornment, having Discord permissions is considered dangerous for 2 reasons:
 - When Discord bans a server, most of the time, they'll also ban "staff" - this includes ANYONE with permissions Discord considers "staff-related". Since our server is prone to being falsely banned, we try to rely on not using Discord permissions as much as possible to avoid our staff from being banned on their main accounts.
 - It's generally safe to not use Discord permissions, as they cannot be as easily monitored from a bot. You should also use something like [Wick](https://wickbot.com/) (just in general, it's a good asf anti-nuke/antiraid bot).