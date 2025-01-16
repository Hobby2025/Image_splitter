declare module 'node-stream-zip' {
    interface ZipEntry {
        name: string;
        isDirectory: boolean;
        size: number;
        compressedSize: number;
    }

    interface ZipEntries {
        [key: string]: ZipEntry;
    }

    interface AsyncZipOptions {
        file: string;
        storeEntries?: boolean;
        skipEntryNameValidation?: boolean;
    }

    class AsyncZip {
        constructor(options: AsyncZipOptions);
        entries(): Promise<ZipEntries>;
        entry(name: string): Promise<ZipEntry | null>;
        entryData(entry: string | ZipEntry): Promise<Buffer>;
        close(): Promise<void>;
    }

    const StreamZip: {
        async: typeof AsyncZip;
    };

    export = StreamZip;
} 