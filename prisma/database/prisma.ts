import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// const prisma = new PrismaClient().$extends({
//   query: {
//     user: {
//       $allOperations({ operation, args, query }: any) {
//         // make hash when create or update a user object
//         if (["create", "update"].includes(operation) && args.data["password"]) {
//           args.data["password"] = bcrypt.hashSync(args.data["password"], 10);
//         }

//         // filter soft-deleted objects from query
//         if (["first","many"].includes(operation) && args.data["password"]) {
//             args.data["password"] = bcrypt.hashSync(args.data["password"], 10);
//           }
//         return query(args);
//       },
//     },
//   },
// });

export default prisma;
