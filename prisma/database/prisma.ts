import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

//TODO add prisma to a global object

const prisma = new PrismaClient().$extends({
    result: {
        user: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute(user) {
                    return `${user.firstName} ${user.lastName}`
                },
            },
        },
    },
    // query: {
    //     user: {
    //         $allOperations({ operation, args, query }: any) {
    //             // make hash when create or update a user object
    //             if (["create", "update"].includes(operation) && args.data["password"]) {
    //                 args.data["password"] = bcrypt.hashSync(args.data["password"], 10);
    //             }

    //             // filter soft-deleted objects from query
    //             if (["first", "many"].includes(operation) && args.data["password"]) {
    //                 args.data["password"] = bcrypt.hashSync(args.data["password"], 10);
    //             }
    //             return query(args);
    //         },
    //     },
    // },
});

export default prisma;
