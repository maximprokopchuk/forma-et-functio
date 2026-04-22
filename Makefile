.PHONY: diff-upstream

# Compare lib/middleware/api-auth files against upstream diabolus-in-musica.
# Updates the SNAPSHOT commit SHA when we intentionally absorb upstream changes.
diff-upstream:
	@git --git-dir=/Users/maksimprokopcuk/repo/diabolus-in-musica/.git \
		diff d964637..main -- src/lib/ src/middleware.ts src/app/api/auth/
