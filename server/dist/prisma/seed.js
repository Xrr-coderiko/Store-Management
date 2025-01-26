"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => {
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            return modelName.charAt(0).toUpperCase() + modelName.slice(1);
        });
        for (const modelName of modelNames) {
            const model = prisma[modelName];
            if (model) {
                try {
                    yield model.deleteMany({});
                    console.log(`Cleared data from ${modelName}`);
                }
                catch (error) {
                    console.error(`Failed to clear data for ${modelName}:`, error);
                }
            }
            else {
                console.error(`Model ${modelName} not found. Skipping...`);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.resolve(__dirname, "seedData");
        const orderedFileNames = [
            "products.json",
            "expenseSummary.json",
            "sales.json",
            "salesSummary.json",
            "purchases.json",
            "purchaseSummary.json",
            "users.json",
            "expenses.json",
            "expenseByCategory.json",
        ];
        yield deleteAllData(orderedFileNames);
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            if (!fs_1.default.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }
            const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
            if (!model) {
                console.error(`No Prisma model matches the file name: ${fileName}`);
                continue;
            }
            for (const data of jsonData) {
                try {
                    yield model.create({ data });
                }
                catch (error) {
                    console.error(`Failed to seed data for ${modelName} from ${fileName}:`, error);
                }
            }
            console.log(`Seeded ${modelName} with data from ${fileName}`);
        }
    });
}
main()
    .catch((e) => {
    console.error("Error in main execution:", e);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
