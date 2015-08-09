# Date-Challenge
https://labnotes.org/code-challenge-tell-the-date/

Imagine your computer's clock is not longer set correctly, and it tells the wrong time. You want to find out what the time is, good within plus/minus one second.

The HTTP protocol specifies that servers should return the Date header. Based on this header, you can tell what the time is according to some other computer*.

You have a file called hostnames.txt with a list of servers, it looks like this:
```
labnotes.org  
example.com  
mathforum.org  
slack.com  
github.com  
facebook.com  
twitter.com  
```

Write a simple script that uses this list of servers to tell the time. When executed, the script should print out the time in ISO 8601 format to the console. For example:

```
$ node time.js
2015-08-03T04:36:54.000Z  
```

Any version of Node/io.js, but the script should be self contained, no dependencies allowed.

* Yes, NTP servers are a better way to tell the time), but it won't be an interesting challenge using NTP, wouldn't it?
