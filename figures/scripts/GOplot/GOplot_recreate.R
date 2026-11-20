# GOplot (GOBubble, GOCircle, GOChord, GOCluster) on oligodendrocyte markers vs all other Zeisel 2015 cell types
# (clusterProfiler enrichGO BP, mouse) - logFC from FindAllMarkers.
suppressPackageStartupMessages({library(GOplot); library(clusterProfiler); library(org.Mm.eg.db); library(dplyr); library(ggplot2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); if (!file.exists("../_data/zeisel_markers.csv")) system("Rscript ../_data/zeisel_de.R")
m <- read.csv("../_data/zeisel_markers.csv") %>% filter(cluster == "oligodendrocytes", p_val_adj < .01) %>% slice_max(avg_log2FC, n = 300)
ego <- enrichGO(m$gene, OrgDb = org.Mm.eg.db, keyType = "SYMBOL", ont = "BP", pvalueCutoff = .01, readable = FALSE) %>% simplify(cutoff = .6)
e <- as.data.frame(ego) %>% head(12); terms <- data.frame(category = "BP", ID = e$ID, term = e$Description, genes = gsub("/", ", ", e$geneID), adj_pval = e$p.adjust)
genes <- data.frame(ID = m$gene, logFC = m$avg_log2FC); circ <- circle_dat(terms, genes)
ggsave("v1_GOBubble.png", GOBubble(circ, labels = 3, table.legend = FALSE, display = "single") + ggtitle("GOBubble: oligodendrocyte marker BP terms"), width = 8, height = 7, dpi = 140, bg = "white")
png("v2_GOCircle.png", 1700, 1100, res = 140); print(GOCircle(circ, nsub = 8, rad1 = 2, rad2 = 3, table.legend = TRUE, label.size = 4)); dev.off()
sel <- unique(circ$term)[1:6]; genes$ID <- toupper(genes$ID); topg <- genes %>% filter(ID %in% circ$genes[circ$term %in% sel]) %>% slice_max(logFC, n = 35)  # circle_dat upper-cases symbols
chord <- chord_dat(circ, topg, sel)
png("v3_GOChord.png", 1700, 1800, res = 140); print(GOChord(chord[, colnames(chord) != "logFC"], nlfc = 0, space = .02, gene.order = "none", gene.space = .25, gene.size = 4, border.size = .1, process.label = 8)); dev.off()
# (GOCluster / GOHeat omitted and GOChord drawn without the logFC ring: GOplot logFC gradients fail with ggplot2 >= 3.5)
