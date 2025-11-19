let pipeline = null;
let embedder = null;

export async function initializePipeline() {
    if (!pipeline) {
        const transformers = await import("@huggingface/transformers");
        pipeline = transformers.pipeline;
    }
    return pipeline;
}

export async function initializeEmbedder() {
    if (!embedder) {
        console.log("Loading BGE-Large embedding model (1024 dimensions)...");
        const pipelineFunc = await initializePipeline();
        embedder = await pipelineFunc(
            "feature-extraction",
            "Xenova/bge-large-en-v1.5",
            {
                quantized: false,
            }
        );
        console.log("BGE-Large model loaded!");
    }
    return embedder;
}
