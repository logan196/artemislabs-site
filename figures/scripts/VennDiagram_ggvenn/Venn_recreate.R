# VennDiagram / ggvenn / ggVennDiagram: marker overlaps between Zeisel 2015 glial cell types
suppressPackageStartupMessages({library(VennDiagram); library(ggvenn); library(ggVennDiagram); library(dplyr); library(ggplot2); library(grid)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); if (!file.exists("../_data/zeisel_markers.csv")) system("Rscript ../_data/zeisel_de.R")
futile.logger::flog.threshold(futile.logger::ERROR, name = "VennDiagramLogger")
m <- read.csv("../_data/zeisel_markers.csv") %>% filter(p_val_adj < .01, avg_log2FC > 1); L <- split(m$gene, m$cluster)
g4 <- L[c("astrocytes_ependymal","oligodendrocytes","microglia","endothelial-mural")]
v <- venn.diagram(g4, filename = NULL, fill = c("#66c2a5","#fc8d62","#8da0cb","#e78ac3"), alpha = .5, cex = 1.1, cat.cex = 1, main = "VennDiagram: glial/vascular marker overlap", category.names = c("astro","oligo","microglia","endo-mural"))
png("v1_VennDiagram_4set.png", 1200, 1200, res = 170); grid.draw(v); dev.off()
ggsave("v2_ggvenn_3set.png", ggvenn(L[c("interneurons","pyramidal CA1","pyramidal SS")], fill_color = c("#1b9e77","#d95f02","#7570b3"), stroke_size = .5, set_name_size = 4) + ggtitle("ggvenn: neuronal marker overlap"), width = 6, height = 6, dpi = 150, bg = "white")
ggsave("v3_ggVennDiagram_gradient.png", ggVennDiagram(g4, label_alpha = 0, category.names = c("astro","oligo","microglia","endo")) + scale_fill_distiller(palette = "Reds", direction = 1) + ggtitle("ggVennDiagram (region fill = count)"), width = 7, height = 6, dpi = 150, bg = "white")
