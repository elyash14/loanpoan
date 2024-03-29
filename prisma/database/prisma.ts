import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
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
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
