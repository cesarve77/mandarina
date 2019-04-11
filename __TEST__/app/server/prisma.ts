import {Prisma} from "./generated/prisma";

const prisma = new Prisma({
    endpoint: 'http://localhost:5577/mandarina/test',
    secret: "7Phk8i3M29wTutl7TFRrlPM7NrGFJaxEPEOMLFoDEIlWZwUGZBYafA5QSzlrzGTd9xPK03buzmhoGZUvqGut7n9NNi2cPLfM6UmWLlg8wlm2a5mpBEIwRG9uO1xrAA3w"
})

export default prisma

