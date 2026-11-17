# survminer: Kaplan-Meier + risk table; glioma survival data from coin::glioma if available, else survival::lung
suppressPackageStartupMessages({library(survival); library(survminer)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
if (requireNamespace("coin", quietly = TRUE)) { data("glioma", package = "coin"); d <- glioma; d$status <- as.numeric(d$event); f <- Surv(time, status) ~ group; ttl <- "coin::glioma (Grana 2002): radioimmunotherapy vs control" } else { d <- lung; f <- Surv(time, status) ~ sex; ttl <- "survival::lung" }
fit <- surv_fit(f, data = d)
p <- ggsurvplot(fit, data = d, pval = TRUE, conf.int = TRUE, risk.table = TRUE, palette = c("#2E9FDF","#E7B800"), title = ttl, ggtheme = theme_classic())
png("v1_km_risktable.png", 1100, 1000, res = 150); print(p); dev.off()
p2 <- ggsurvplot(fit, data = d, fun = "cumhaz", palette = "npg", title = "Cumulative hazard")
png("v2_cumhaz.png", 1000, 800, res = 150); print(p2); dev.off()
if (exists("glioma")) { cx <- coxph(Surv(time, status) ~ group + age + sex + histology, data = d) } else { cx <- coxph(Surv(time, status) ~ age + sex + ph.ecog, data = d) }
png("v3_forest.png", 1100, 700, res = 150); print(ggforest(cx, data = d)); dev.off()
