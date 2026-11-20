# pathview: Zeisel 2015 interneuron-vs-pyramidal-SS log2FC painted onto KEGG GABAergic (mmu04727) and
# glutamatergic (mmu04724) synapse maps (KEGG XML/PNG fetched once from KEGG REST at run time).
suppressPackageStartupMessages({library(pathview); library(Seurat); library(org.Mm.eg.db)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds"); Idents(so) <- "celltype"
d <- FindMarkers(so, ident.1 = "interneurons", ident.2 = "pyramidal SS", logfc.threshold = .1, min.pct = .1, verbose = FALSE)
eg <- AnnotationDbi::mapIds(org.Mm.eg.db, rownames(d), "ENTREZID", "SYMBOL"); fc <- setNames(d$avg_log2FC, eg); fc <- fc[!is.na(names(fc))]
dir.create("kegg", showWarnings = FALSE); old <- setwd("kegg")
for (pw in c("04727","04724")) pathview(gene.data = fc, pathway.id = pw, species = "mmu", out.suffix = "interneuron_vs_pyrSS", limit = list(gene = 3), low = list(gene = "#2166ac"), high = list(gene = "#b2182b"), kegg.native = TRUE)
pathview(gene.data = fc, pathway.id = "04727", species = "mmu", out.suffix = "graphviz", kegg.native = FALSE, sign.pos = "bottomleft", limit = list(gene = 3))
setwd(old)
file.copy("kegg/mmu04727.interneuron_vs_pyrSS.png", "v1_GABAergic_synapse_native.png", overwrite = TRUE)
file.copy("kegg/mmu04724.interneuron_vs_pyrSS.png", "v2_glutamatergic_synapse_native.png", overwrite = TRUE)
pdfs <- list.files("kegg", "graphviz.pdf$", full.names = TRUE); if (length(pdfs)) system(paste("pdftoppm -png -r 110 -singlefile", shQuote(pdfs[1]), "v3_GABAergic_graphviz"))
