import { Interpreter, Parser, values, utils, Ast } from "aiscript_next";
export { Interpreter, Parser, values, utils, Ast };
export const version = "next";
export const samples = {
  ["Hello AiScript"]: '<: "Hello, AiScript!"',
  FizzBazz: `for (let i, 100) {
		<: if (i % 15 == 0) "FizzBuzz"
			elif (i % 3 == 0) "Fizz"
		elif (i % 5 == 0) "Buzz"
		else i
	}`,
};
