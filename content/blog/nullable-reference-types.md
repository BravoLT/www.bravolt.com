---
title: Getting Started with Nullable Reference Types in C# 8
date: 2019-05-08T12:00:00+06:00
image: images/blog/null.png
author: Ed DeVries, Software Developer
---

The next version of the C# language, C# 8, is scheduled to ship [in September 2019](https://github.com/dotnet/core/blob/master/roadmap.md#upcoming-ship-dates) along with .NET Core 3.
C# 8 brings some [pretty cool features](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8) to the language.
One of the features I'm most excited about is Nullable Reference Types, which enables developers to prevent many of the problems that often come along with null values.

C# 8 and .NET Core 3 are already in public preview, so you can give them a whirl right now.
In this post, I'm going to walk you through a simple example to demonstrate how to take advantage of Nullable Reference Types.

But first, a bit of background.

##### Value types and reference types

Data types in C# fall into two broad categories: value types and reference types.

Value types are the simpler kind: integers, Booleans, characters, and so forth.
When you create a variable of a value type, you can think of the variable as "holding" the value (disclaimer: this is a mental model, not a robust description of your computer's memory).

For instance, the statement

```csharp
int x = 4;
```

creates the variable `x` of type `int` and gives it the value `4`.
If you were to do something to `x`, say,

```csharp
x++;
```

then `x` would hold the value `5` and the value `4` would be gone.

Reference types are the more complicated kind: objects, strings, etc.
When you create a variable of a reference type, the variable doesn't so much "hold" the value as "point to" (or "reference") the value.

For instance, the statement

```csharp
Person p = new Person { FirstName = "Bowser", LastName = "Castle" };
```

creates the variable `p` of type `Person`, places the object data somewhere in memory, and gives `p` the location of that data.

If you were to do something to _a property of_ `p`, say,

```csharp
p.Age = 62;
```

`p` would still hold the same value: a reference to the object.
Only the object data would change.

On the other hand, if you were to do something to `p` _itself_, say,

```csharp
p = new Person { FirstName = "Ganon", LastName = "Tower" };
```

a new object would be created in memory (Ganon Tower) and `p` would be updated with the location of the new object.
The old object (Bowser Castle) would be left hanging around in memory with no variable pointing to it - at least until the ~~plumber~~ garbage collector got around to cleaning it up.

The way that reference types work - pointing to the data rather than holding the data - has a strange consequence: a reference type variable can point to nothing.

##### Null values

In C#, value types cannot be null unless you explicitly declare a variable as nullable.
A statement like

```csharp
bool b = null;
```

will not compile.
There is no such thing as a `bool` with no value - it has to be either true or false.
In fact, if you fail to provide a value, you'll get a sensible default.
A declaration like

```csharp
bool b;
```

will give `b` the value `false`, which is the default for Booleans.

Usually, this is a good thing.
In the off chance that you want a nullable value type, you can declare it with a question mark:

```csharp
bool? b = null;
```

Reference types, on the other hand, are nullable right from the start.
Let's make that same traditional declaration with a reference type:

```csharp
string s;
```

We now have a `string` type variable called `s`, but we haven't yet created a real `string` object in memory, so `s` points to nothing.
This is represented by `s` getting the value `null`.

Oddly, even though `s` does not point to an actual string, the compiler allows you to write expressions like `s.Length`.
This throws a `NullReferenceException` because you are attempting to dereference a null reference.
In other words, you are trying to access a member of an object that doesn't exist, so your program blows up.

All the compiler knows is that `s` is of type `string`, and objects of type `string` have a `Length` property.
Unfortunately, in this case, we have no object, and thus no `Length` property.

I won't go into why languages like C# allow null references in the first place, partly because it's beyond the scope of this post, but also because the lead designer of C# wrote [an excellent article](https://devblogs.microsoft.com/dotnet/nullable-reference-types-in-csharp/) that covers that very topic.
I would recommend it if you're interested in the design rationale behind Nullable Reference Types (which we really _will_ be getting to in just a moment).

For now, all I hope to demonstrate is that we have a conundrum: reference type variables can be null, but the compiler doesn't have a good way to help us to deal with those nulls responsibly.
We are human beings and sometimes we are irresponsible, so we end up with a `NullReferenceException` at runtime.

##### Nullable Reference Types

To solve this problem, C# 8 introduces a feature called "Nullable Reference Types".
The feature has two main parts that work together: some familiar syntax you can use to declare which reference types should be nullable and some compiler warnings to help you to follow through on that intent.

Let's see it in action.
If you'd like to paint along with us at home, here are the tools we'll be using (all of which are cross-platform):

- [.NET Core SDK 3.0 Preview - latest](https://dotnet.microsoft.com/download/dotnet-core/3.0)
- [Visual Studio Code](https://code.visualstudio.com/)
- [The C# extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-vscode.csharp)

To begin, we'll open a terminal, create an empty directory, and scaffold a new .NET Core console app:

```bash
mkdir nullable-sample
cd nullable-sample
dotnet new console
```

There are two new files in our directory.
We'll run `code .` to inspect them in VS Code.

The project file is `nullable-sample.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp3.0</TargetFramework>
    <RootNamespace>nullable_sample</RootNamespace>
  </PropertyGroup>

</Project>
```

The main program is `Program.cs`:

```csharp
using System;

namespace nullable_sample
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
        }
    }
}
```

As you can see, `dotnet new console` created a simple "hello world" app.
Let's build it and run it, just to get a baseline of the output we expect.

`dotnet build` compiles the code and shows us if it found any problems:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

`dotnet run` both compiles and runs the code, displaying the program's console output:

```text
Hello World!
```

Now that we have a running sample, let's add some code.

To demonstrate handling null references, we'll start by defining a `Person` class to represent someone's full name.

```csharp
public class Person
{
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
}
```

Many people have at least a given name and a surname, but middle names are not common in all cultures, and even where they are common, people do not always provide their middle name.
If we have a database of people, it might have a lot of nulls in the middle name column.
Let's create a mock data access class to pretend like we're retrieving the first record we find in a database full of people.

```csharp
public class PersonStore
{
    public static Person GetFirstPerson()
        => new Person { FirstName = "Pat", LastName = "McTest" };
}
```

Now we can use this data access code in our main program to do something interesting with a `Person` object, like counting the number of characters in the person's full name and displaying it to the console.

```csharp
static void Main(string[] args)
{
    Person p = PersonStore.GetFirstPerson();

    int letterCount =
        p.FirstName.Length +
        p.MiddleName.Length +
        p.LastName.Length;

    Console.WriteLine($"Hello, {p.FirstName}");
    Console.WriteLine($"You have {letterCount} letters in your full name");
}
```

That seems easy enough.
However, there is a sneaky bug lurking in this code.
Before we address it, let's see how our program behaves.

The code compiles without issue.
The output of `dotnet build` is no different than before:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

When we run the code, however, we encounter a problem.
Here is the output of `dotnet run`:

```text
Unhandled Exception: System.NullReferenceException: Object reference not set to an instance of an object.
```

The problem here is that we neglected to check for null before accessing the `Length` property of `p.MiddleName`.
Our mock person record lacks a middle name, so at runtime, `p.MiddlName` was null.
Let's sweep this bug under the rug by giving Pat a middle initial.
I'm feeling lazy today and I need to ship this code.

```csharp
public static Person GetFirstPerson()
    => new Person { FirstName = "Pat", MiddleName = "Q", LastName = "McTest" };
```

If we run the code, it works! Hooray!

```text
Hello, Pat
You have 10 letters in your full name
```

Unfortunately, we now have a more insidious problem.
Our code works fine with our test data, but what will happen when we load a record from a real database and the middle name is missing?

We could uncover the bug by adding more tests - and indeed, we absolutely should - but wouldn't it be great if the compiler could help us fix it right now?

Let's enable the Nullable Reference Types feature.
To do this, we have to add two lines to our project file: one to specify that we're using C# 8 and one to turn on the feature.

```xml
<LangVersion>8.0</LangVersion>
<NullableContextOptions>enable</NullableContextOptions>
```

Just to see that in context, here is our modified `nullable-sample.csproj` file:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>netcoreapp3.0</TargetFramework>
    <RootNamespace>nullable_sample</RootNamespace>
    <LangVersion>8.0</LangVersion>
    <NullableContextOptions>enable</NullableContextOptions>
  </PropertyGroup>

</Project>
```

With the feature enabled, let's try to compile our code again. Here is the output of `dotnet build`:

```text
Build succeeded.

Program.cs(23,23): warning CS8618: Non-nullable property 'FirstName' is uninitialized. [/home/ed/source/nullable-sample/nullable-sample.csproj]
Program.cs(24,23): warning CS8618: Non-nullable property 'MiddleName' is uninitialized. [/home/ed/source/nullable-sample/nullable-sample.csproj]
Program.cs(25,23): warning CS8618: Non-nullable property 'LastName' is uninitialized. [/home/ed/source/nullable-sample/nullable-sample.csproj]
    3 Warning(s)
    0 Error(s)
```

The build succeeded, just as before, but now we have some warnings. Progress!

The compiler is telling us two things:

- The properties of our `Person` class are all considered "non-nullable"
- Given that they're non-nullable, they should be initialized

Wait a minute.
All three properties of `Person` are strings.
Strings are nullable, right?

Yes, it is just as possible as ever to assign `null` to a string.
The warnings we received are speaking about our _intent_.
When the Nullable Reference Types feature is enabled, the compiler considers reference types to be non-nullable by default, just like value types.
If you want a property to be nullable, you have to declare it that way.

Let's say that our application requires each person to have a first and last name but makes the middle name optional.
This means that `FirstName` and `LastName` should be initialized to ensure they always have a value.
The empty string would be a sensible default.

```csharp
public class Person
{
    public string FirstName { get; set; } = string.Empty;
    public string MiddleName { get; set; }
    public string LastName { get; set; } = string.Empty;
}
```

`dotnet build` now generates only one warning:

```text
Build succeeded.

Program.cs(24,23): warning CS8618: Non-nullable property 'MiddleName' is uninitialized. [/home/ed/source/nullable-sample/nullable-sample.csproj]
    1 Warning(s)
    0 Error(s)
```

Because `MiddleName` is optional in our application, instead of initializing it, we'll mark it as nullable.
We do this by appending a question mark to the type, which is the same syntax we used earlier to make a value type nullable.

```csharp
public string? MiddleName { get; set; }
```

Now we have a more expressive domain model.
`FirstName` and `LastName` are required, so we initialize them.
`MiddleName` is optional, so we mark it as nullable.
The code looks better already.

Let's see how it compiles.

```text
Build succeeded.

Program.cs(13,17): warning CS8602: Dereference of a possibly null reference. [/home/ed/source/nullable-sample/nullable-sample.csproj]
    1 Warning(s)
    0 Error(s)
```

Now we have a new warning.
"Dereference of a possibly null reference" means that we are accessing a member of an object that might be null, and we haven't responsibly checked to make sure it isn't null.
Evidently, the culprit is on line 13.

```csharp
Person p = PersonStore.GetFirstPerson();

int letterCount =
    p.FirstName.Length +
    p.MiddleName.Length +
    p.LastName.Length;
```

Line 13 contains `p.MiddleName.Length`.
This was the line that generated the `NullReferenceException` earlier, but now we're getting a helpful warning about it.
Because we marked `MiddleName` as nullable, we have to check to make sure it isn't null before accessing any of its members, in this case its `Length` property.

Let's add a null check (which we really should have done from the very beginning, had we not been in such a hurry).

```csharp
int letterCount =
    p.FirstName.Length +
    (p.MiddleName?.Length ?? 0) +
    p.LastName.Length;
```

Now our code builds without warnings:

```text
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

The warning went away because the compiler is capable of analyzing the control flow of a program and determining where null values may occur.
By checking to make sure that `p.MiddleName` was non-null before accessing its `Length` property, we soothed the compiler's fears.

Our program runs successfully:

```text
Hello, Pat
You have 10 letters in your full name
```

But is the bug really fixed?
Recall that earlier, we added a middle name to our test person in order to prevent a `NullReferenceException`.
Let's remove that test middle name and find out if our code has actually improved.

```csharp
public static Person GetFirstPerson()
    => new Person { FirstName = "Pat", LastName = "McTest" };
```

The moment of truth. `dotnet run`:

```text
Hello, Pat
You have 9 letters in your full name
```

Success!
Even with a null value in our test data, our program ran safely.

Note that we converted our buggy code to null-safe code simply by following the indications provided to us by the compiler.
This is the real value of the Nullable Reference Types feature: it helps you write safer and more expressive code.

##### Recap

You can try out C# 8 with Nullable Reference Types right now.
However, keep in mind that .NET Core 3 still in preview as of the time of writing, so you might not want to use it for production code until the first stable release.

First, [download the latest preview release of .NET Core 3](https://dotnet.microsoft.com/download/dotnet-core/3.0).

Second, specify .NET Core 3, C# 8, and the "nullable context options" properties in your `.csproj` file:

```xml
<TargetFramework>netcoreapp3.0</TargetFramework>
<LangVersion>8.0</LangVersion>
<NullableContextOptions>enable</NullableContextOptions>
```

Third, explicitly indicate that a reference type should be allowed to carry null values by appending a question mark to the type:

```csharp
public string? MiddleName { get; set; }
```

And finally, pay attention to the warnings you get from `dotnet build` and use them as a guide to improving your code.

If you'd like to see the full example app we walked through in this post, it's available [on GitHub](https://github.com/ehdevries/learning-nullable-reference-types).

##### Going further

By design, the Nullable Reference Types feature generates warnings, not errors.
This is so that you can start fixing problems in existing code without spilling noisy red ink all over the place.

If you do want actual errors that fail the build, you can choose to treat all warnings as errors.
This is an existing feature in current versions of .NET (not just in .NET Core 3), and it can be enabled by adding one more property to a `PropertyGroup` in your `.csproj` file:

```xml
<TreatWarningsAsErrors>true</TreatWarningsAsErrors>
```

We covered the basics of Nullable Reference Types in this post, but there is even more to the feature.
If you'd like to dig deeper, check out these articles:

- *[Introducing Nullable Reference Types in C#](https://devblogs.microsoft.com/dotnet/nullable-reference-types-in-csharp/)* by Mads Torgerson
- Microsoft's [official guide](https://docs.microsoft.com/en-us/dotnet/csharp/nullable-references) to Nullable Reference Types
- Microsoft's [official tutorial](https://docs.microsoft.com/en-us/dotnet/csharp/tutorials/nullable-reference-types) on Nullable Reference Types
