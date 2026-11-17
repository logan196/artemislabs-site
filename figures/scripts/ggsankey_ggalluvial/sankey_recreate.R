# Flow plots of Zeisel hierarchy: tissue -> level1 class -> level2 subclass
suppressPackageStartupMessages({library(ggplot2); library(ggsankey); library(ggalluvial); library(dplyr)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
md <- readRDS("../_data/zeisel_seurat.rds")@meta.data
top2 <- names(sort(table(md$level2class), decreasing = TRUE))[1:18]; md$sub <- ifelse(md$level2class %in% top2, md$level2class, "other")
d <- make_long(md, tissue, celltype, sub)
g <- ggplot(d, aes(x = x, next_x = next_x, node = node, next_node = next_node, fill = factor(node), label = node)) + geom_sankey(flow.alpha = .55, node.color = "grey30") + geom_sankey_label(size = 2.6, color = "black", fill = "white") + theme_sankey(base_size = 12) + theme(legend.position = "none") + labs(x = NULL, title = "ggsankey: tissue -> class -> subclass")
ggsave("v1_ggsankey.png", g, width = 10, height = 7, dpi = 130, bg = "white")
g <- ggplot(d, aes(x = x, next_x = next_x, node = node, next_node = next_node, fill = factor(node))) + geom_alluvial(flow.alpha = .6) + theme_alluvial() + theme(legend.position = "none") + labs(x = NULL, title = "ggsankey alluvial style")
ggsave("v2_ggsankey_alluvial.png", g, width = 9, height = 6, dpi = 130, bg = "white")
cnt <- md %>% count(tissue, celltype, sub)
g <- ggplot(cnt, aes(axis1 = tissue, axis2 = celltype, axis3 = sub, y = n)) + geom_alluvium(aes(fill = celltype), width = 1/8) + geom_stratum(width = 1/8, fill = "grey95", color = "grey40") + geom_text(stat = "stratum", aes(label = after_stat(stratum)), size = 2.4) + scale_x_discrete(limits = c("tissue","class","subclass")) + theme_minimal() + labs(title = "ggalluvial: coloured by class")
ggsave("v3_ggalluvial.png", g, width = 10, height = 7, dpi = 130, bg = "white")
