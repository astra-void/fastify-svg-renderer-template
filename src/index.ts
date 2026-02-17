import awsLambdaFastify from "@fastify/aws-lambda";
import { buildApp } from "./app";

const app = buildApp();
export const handler = awsLambdaFastify(app);

const isLambda =
	Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) || Boolean(process.env.LAMBDA_TASK_ROOT);

if (!isLambda && process.env.LOCAL_DEV === "1") {
	const port = Number(process.env.PORT ?? 3000);
	app.listen({ port, host: "0.0.0.0" }).catch((err) => {
		console.error(err);
		process.exitCode = 1;
	});
}
