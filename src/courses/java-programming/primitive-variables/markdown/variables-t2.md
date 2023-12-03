To declare variables, you must this basic syntax:

```java
VariableType variableName = variableValue;
```

In some cases, you don't want to give the variable a value immediatley. In that case, you can omit the equals sign.

```java
VariableType variableName;
```

When you initialize a primitive type with no inital value, it is given a default value matching its type. Some examples of these are shown below.

| Type    | Default Value |
| ------- | ------------- |
| int     | 0             |
| double  | 0.0           |
| boolean | false         |
| char    | ''            |

> Sometimes, you will see `public` or `private` written before the type. These are called visibility modifiers, which we will cover later.
