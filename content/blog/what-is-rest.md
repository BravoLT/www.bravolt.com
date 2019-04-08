---
title: What is REST?
date: 2019-04-05T12:11:29+06:00
image: images/blog/what-is-rest.png
author: Sam Berry, Senior Software Developer
---
##### What is REST? #####
Representational State Transfer (REST) is a very popular term in web development today. REST is used to describe many things, kind of like “API”, and because of that I was very confused by the acronym. The goal of this post is to provide a high-level description of REST in hopes that you will navigate away with a better understanding of the architectural style.

##### What is RESTful? #####
If you have worked on web software, chances are you have been a part of a design discussion where somebody declared, “______ would be more RESTful”. *What does that mean?*

It is important to note that REST is a specification not an implementation. In other words, REST defines the requirements for a system but does not define how you should write your code in order to meet those requirements. For example, to say that plural paths (`/users`) are more RESTful than singular paths (`/user`) is not necessarily true. Instead, it is more correct to say: it is RESTful to choose either plural or singular paths to use across the whole system in order to provide a consistent API. REST does not care what naming convention is used as long as the convention is consistent across all interfaces. This is defined by the Uniform Interface constraint.

Constraints are what define the requirements for REST. Once you understand the constraints you can confidently declare what is and is not RESTful.

##### Constraints #####
There are six architectural constraints that define REST. Their original definition can be found in Roy Fielding’s dissertation, section [5.1 Deriving REST](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm#sec_5_1), and I will summarize them here.

##### Client-Server #####
The client-server constraint involves separating client concerns from server concerns. Let us simplify an application into two parts: user interface and business logic. Business logic stays the same whether a consumer is using an Apple or an Android phone, but the user interface code can be different. A client-server system separates business logic from the user interface so that server code can be written once and service a variety of clients.

![Client Server](/images/blog/what-is-rest-client-server.jpg)

##### Stateless #####
The stateless constraint can be described as, “stateful client, stateless server” where statelessness is preserved on the server. An example of state is a user’s session. A common way to implement authentication in a web application is to utilize a session, which can look something like this:

+ User logs in with a username and password. This sends a request from the client to the server with the credentials.
+ If successful, the server creates a session and responds to the client with a session ID. The session is managed by the server.
+ While the user is logged in, every request must include the session ID. With each request, the server checks the session ID to authenticate the request.

This approach is not RESTful because it requires the server to keep track of sessions for each client. It also violates the stateless constraint because each request does not include all of the information needed in order to determine the full nature of the request. A more RESTful approach would look like:

+ User logs in with a username and password. This sends a request from the client to the server with the credentials.
+ If successful, the client saves the username and password. Every request going forward includes the username and password.
+ For each request, the server verifies the username and password. No session is managed by the server.

There are trade-offs to each approach. A stateful server can be more efficient, a stateless server can be more scalable. Do what makes the most sense for your business case, but know that REST specifically calls for stateless server.

![Stateless](/images/blog/what-is-rest-stateless.jpg)

##### Cache #####
Web applications are bound to networks by nature. A consequence of network communication is that it takes time to transfer information through a wire. In order to provide an efficient system, it is important to utilize mechanisms that optimize the amount of information that must be transferred. One optimization strategy is caching, the third constraint of REST.

Caching involves storing server data on the client. This enables a client to avoid repetitive requests to the server to retrieve the same data. When implementing a cache, it is important to understand when cached data should expire. Caching is great for increasing performance, but has the consequence of providing out-of-date information if not managed correctly. Seek to implement caches where data rarely changes or where there is a reliable way to refresh the cache when data does change.

According to REST, caching should always be done client-side. *Note: a server can be both a server and a client!*

![Cache](/images/blog/what-is-rest-cache.jpg)

##### Uniform Interface #####
The uniform interface constraint focuses on the manner in which a system communicates itself to other systems or clients. This focuses on the API layer and is described through four sub-constraints.

##### Identification of Resources #####
Identification of resources deals with how the functionality of an API is described. For an example, let us look at an application that allows creating and managing users. The following functions are available:

* Get all users
* Add a new user
* Get a user
* Update a user’s name
* Update a user’s birthday
* Delete a user

</br>
*Let us examine two potential HTTP API designs:*
</br>

<img src="/images/blog/function-design-a-design-b.PNG" alt="Function" width="600"/>

Design A represents what is commonly found in SOAP or other non-REST architectures. Design B is typically preferred in a RESTful design because it identifies operations in a more uniform and predictable manner.

##### Manipulation of Resources Through Representations #####
A “representation” can be thought of as a JSON structure. To continue the user example from above, the request to `GET /users/{id}` might return a response of:

```
{
  “id”: 1,
  “name”: “Joseph”
  “bday”: “1992/09/25”
}
```

This is the user representation. The manipulation of resources through representations constraint defines that an interface should use consistent structures when referring to the same entity. So when a user is being created, updated, retrieved, or referenced; its structure remains the same.

##### Self-Descriptive Messages #####
The self-descriptive messages constraint requires requests and responses to define all of the information needed to understand the purpose of the request/response. In HTTP, this includes the use of headers, status codes, and HTTP methods (GET, PUT, POST, etc).

A redirect response is a good example of this constraint. Let us pretend that a client is requesting a user’s profile picture, but the location of the picture has moved. The proper service response would include a 302 HTTP status code (Object Moved) with a `Location` header that points to the new location of the picture. Browsers are programmed to automatically handle this interaction so that a user sees no difference. If a server is improperly programmed and the `Location` header is missing, the response will not include all of the required information and the user will be left with an incomplete view.

##### Hypermedia as the Engine of Application State (HATEOAS) #####
HATEOAS sounds complicated, but really what it means is that links (URLs) should be provided by a server to direct clients through available functionality. A way to illustrate this is to think of a homepage. Let us use [StackOverflow.com](https://stackoverflow.com/) as an example. When a client requests the StackOverflow homepage, there are many routes the user can navigate from there: top posts, profile page, hot questions, etc. It is the server’s job to provide URLs to navigate to each of those available functions. The idea being, the only URL a client should need to know is the root/home page. From there, the client can navigate through the links provided in the server’s response. Another example to think about is a website that mimics a book. If the browser requests page 50 from the server, the server should respond with page 50 and also include links to the previous and next page. This allows the client to navigate throughout the book.

##### Layered System #####
A layered system architecture is a common best practice found across most software systems. This style is found internal to code bases as well as external across an entire system. Internally this is observed as separating code into controller, service, and database files. Externally this is observed as maintaining business logic on proprietary systems and delegating to 3rd parties for responsibilities like payment processing, for example. Service-oriented architectures fit nicely into this constraint as they require system components to be isolated by responsibility, creating layers between services.

<img src="/images/blog/what-is-rest-layered-system.jpg" alt="Function" width="600"/>

##### Code-On-Demand #####
The code-on-demand constraint opens the door for servers to provide packaged code to clients for client convenience. This is useful when a system expects all clients to require similar behavior. If a reservation system is used as an example, it could be expected that many clients will require a date picker in order to select a time period for reservations. Code-on-demand defines that it would be RESTful for that reservation system to provide a pre-built JavaScript widget for selecting dates.

##### Summary #####
Client-server, stateless, cache, uniform interface, layered system, and code-on-demand are the core principles that define REST. Hopefully this article provides some insight into the meaning of this popular acronym. If you are interested in diving deeper into the source of the REST architectural style, its origin can be found in [Architectural Styles and the Design of Network-based Software Architectures by Roy Fielding](https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm).
