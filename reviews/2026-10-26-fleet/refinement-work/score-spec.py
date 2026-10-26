"""Blind per-group scores for refinement-review-inputs.json (rubric ky-suite-v2).

Every unique image was viewed at full resolution before these values were fixed.
Key: (product, surface, phase, vp). q = hierarchy, typography, density_layout, color,
visible_affordances, coherence. k = palette_tokens, type_geometry, shell, accent_discipline,
suite_cohesion. `dark` overrides dimensions for OS-dark captures of that group.
"""

Q = ["hierarchy", "typography", "density_layout", "color", "visible_affordances", "coherence"]
K = ["palette_tokens", "type_geometry", "shell", "accent_discipline", "suite_cohesion"]

REC_SHELL = "horizontal tab bar under a header, not the contract 240px sidebar; account controls in header"
REC_SUITE = "tabbed header shell differs from the sidebar shells of DNS, Pulse, Drive, Base, Identity and Notes"

G = {}

def g(key, q, k, obs, kobs, cohort, task_view, state, art=(), cav="", dark=None, conf="high", fmc=True):
    G[key] = dict(q=q, k=k, obs=obs, kobs=kobs, cohort=cohort, task_view=task_view, state=state,
                  art=list(art), cav=cav, dark=dark or {}, conf=conf, fmc=fmc)

# ---------------- KyRecovery ----------------
rec_ov_obs = [
    "h1 'Recovery overview' with exactly one filled primary ('Review backups'); other row actions are outlined",
    "title, plain section heading 'Check your recovery path', 13px meta; large stat numerals set light",
    "three-column stat strip with even dividers, then ruled task rows; footer band below",
    "cream bg and charcoal ink; orange only on the primary and selected tab rail; warning pill tinted",
    "header buttons (SSO pairing, Password, Sign Out) are ~28px outlined; content buttons ~40px",
    "flat ruled rows plus one bordered note box; one outline-button vocabulary",
]
rec_ov_k = ["bg/panel/ink/accent read as Busnes tokens", "content controls ~40px/8px radius; header controls ~28px",
            REC_SHELL, "accent limited to primary action and selected tab", REC_SUITE]
for ph in ("before", "after"):
    g(("KyRecovery-server", "overview", ph, "desktop"), [8, 8, 8, 8, 7, 8], [8, 7, 5, 8, 6],
      rec_ov_obs if ph == "before" else [rec_ov_obs[0], rec_ov_obs[1], "same composition as before; subtitle 2px tighter",
                                         *rec_ov_obs[3:]],
      rec_ov_k, "admin-console", "recovery-overview", "empty",
      art=["full-page capture 1280x1024/1022", "synthetic fresh vault"],
      cav="Empty vault fixture; warning states are real. Interaction, focus and contrast not measurable from pixels.")
g(("KyRecovery-server", "overview", "before", "mobile"), [7, 8, 6, 8, 6, 7], [8, 7, 4, 8, 6],
  [rec_ov_obs[0], rec_ov_obs[1], "header wraps into three rows (status pill; name, role, SSO pairing; Password, Sign Out) before the tabs",
   rec_ov_obs[3], "tab strip clipped mid-word at 'Paired Product' with no scroll cue", "content vocabulary consistent; header buttons wrap ragged"],
  ["tokens match", "content controls ~40px", "no menu button; wrapped header buttons and scrolling tab strip", rec_ov_k[3], REC_SUITE],
  "admin-console", "recovery-overview", "empty", art=["full-page capture 390x1700"], cav="Horizontal tab scroller position as captured.")
g(("KyRecovery-server", "overview", "after", "mobile"), [8, 8, 7, 8, 7, 8], [8, 7, 5, 8, 6],
  [rec_ov_obs[0], rec_ov_obs[1], "header collapsed to wordmark, 'Account' button and status pill; content starts ~90px higher",
   rec_ov_obs[3], "tab strip still clipped at 'Paired Product' with no scroll cue", "one button vocabulary; tidy header"],
  ["tokens match", "content controls ~40px", "account collapsed behind 'Account' button; tabs still horizontal, no drawer", rec_ov_k[3], REC_SUITE],
  "admin-console", "recovery-overview", "empty", art=["full-page capture 390x1607"], cav="Account menu contents not captured.")
rep_cav = "Empty replication fixture; table behaviour with rows not shown."
g(("KyRecovery-server", "replication-via-overview", "before", "desktop"), [6, 7, 7, 8, 7, 7], [8, 6, 5, 8, 6],
  ["no page h1; the card header 'Replication targets' stands in as title", "card titles ~17px, small bold table headers; '.kycap' preceded by a double space",
   "two bordered cards with empty tables; large empty area below", "restrained; accent on 'Add target' and the selected tab",
   "'Add target' is a ~28px filled button; empty-state sentence explains next step", "table-in-card chrome with header rows for empty tables"],
  ["tokens match", "small 28px primary; card heading sizes", REC_SHELL, "accent on primary and tab only", REC_SUITE],
  "admin-console", "replication", "empty", art=["viewport 1280x900"], cav=rep_cav)
g(("KyRecovery-server", "replication-via-overview", "after", "desktop"), [7, 8, 7, 8, 7, 7], [8, 7, 5, 8, 6],
  ["h1 'Offsite replication' added above the cards", "title, card heading and table header steps now distinct",
   "same two-card layout pushed down 62px; empty area below", "restrained; accent on 'Add target' and the selected tab",
   "'Add target' still ~28px filled", "table-in-card chrome unchanged"],
  ["tokens match", "page title at contract size; primary still ~28px", REC_SHELL, "accent on primary and tab only", REC_SUITE],
  "admin-console", "replication", "empty", art=["viewport 1280x900"], cav=rep_cav)
g(("KyRecovery-server", "replication-via-overview", "before", "mobile"), [5, 7, 3, 8, 5, 6], [8, 6, 4, 8, 5],
  ["no page h1; card header is the title", "type steps fine where visible",
   "table columns and empty-state text clipped at the right edge ('Add one', 'Bytes Tran', 'No transfers yet')",
   "restrained palette", "tab strip clipped at left ('roducts'); table headers cut", "card chrome holds empty tables that overflow"],
  ["tokens match", "small primary", "wrapped header and scrolling tabs, no drawer", "accent restrained", "clipped table unlike other Ky mobile captures"],
  "admin-console", "replication", "empty", art=["full-page capture 390x911", "tab scroller positioned on selected tab"], cav=rep_cav)
g(("KyRecovery-server", "replication-via-overview", "after", "mobile"), [7, 8, 7, 8, 7, 7], [8, 7, 5, 8, 6],
  ["h1 'Offsite replication' present", "clear title/card/body steps", "empty tables collapse to wrapped sentences; no clipping",
   "restrained palette", "'Add target' ~28px; tab strip clipped at 'roducts' at left", "card chrome consistent"],
  ["tokens match", "page title at size; small primary", "Account button header; horizontal tabs", "accent restrained", REC_SUITE],
  "admin-console", "replication", "empty", art=["viewport 390x844", "tab scroller positioned on selected tab"], cav=rep_cav)

# ---------------- KyDNS ----------------
dns_shell = "240px sidebar with wordmark and accent-rail selection; no signed-in name, only Sign out and a mono licence line"
dash_art = ["full-page capture; sidebar background ends at 900px while page continues", "live uptime/query ages differ between runs"]
for ph in ("before", "after"):
    g(("KyDNS-server", "dashboard", ph, "desktop"), [7, 6, 7, 7, 7, 7], [7, 6, 7, 8, 7],
      ["h1 'Dashboard'; read-only page led by the stat strip, no competing actions",
       "metric table labels and chart axes in monospace" + ("; after, chart axis labels shrink to ~10px" if ph == "after" else ""),
       "stacked bordered cards with even gaps" + ("; charts ~57px shorter" if ph == "after" else ""),
       "teal/purple/orange chart series are data hues on neutral cards", "only Sign out visible; nav rows clear",
       "every block boxed; mono and sans mixed within one table"],
      ["neutral surfaces match tokens; chart series hues are data", "mono labels outside code/data columns", dns_shell,
       "accent only on selected nav", "sidebar shell matches Pulse/Drive/Base/Identity"],
      "admin-console", "dns-dashboard", "sparse", art=dash_art, cav="Two local records, twelve queries; charts nearly flat.")
g(("KyDNS-server", "dashboard", "before", "mobile"), [6, 5, 5, 7, 7, 6], [7, 5, 4, 8, 6],
  ["h1 present; header nav occupies ~200px first", "queries-chart axis labels ~6px, unreadable",
   "stat grid second-row items indented and misaligned with first row", "data hues on neutral cards",
   "nav items legible; Sign out outlined", "boxed cards; misaligned grid breaks rhythm"],
  ["tokens match", "tiny axis type; mono table", "nav wraps into three rows with the licence line in the header", "accent only on selected nav", "wrapped shell unlike other mobile captures"],
  "admin-console", "dns-dashboard", "sparse", art=["full-page capture 390x1715"] + dash_art[1:], cav="Live values differ between runs.")
g(("KyDNS-server", "dashboard", "after", "mobile"), [7, 7, 7, 7, 7, 7], [7, 6, 6, 8, 7],
  ["h1 present directly under a one-row header", "axis labels legible (~10px)", "stat grid aligned in two even columns",
   "data hues on neutral cards", "tab scroller cuts 'Discovered' at the right edge", "consistent boxed cards"],
  ["tokens match", "mono table labels remain", "one-row header with Sign out and horizontal tab scroller; no drawer", "accent only on selected tab", "header + tab scroller pattern shared with Pulse/Base/Recovery"],
  "admin-console", "dns-dashboard", "sparse", art=["full-page capture 390x1806"] + dash_art[1:], cav="Live values differ between runs.")
app_obs = ["h1 'Appearance', one-line explanation and 'Theme' legend; 23 cards (Match system + 22 named)",
           "card name 15px over 13px Light/Dark kind", "even 5-column grid (2 on mobile) with equal gutters",
           "orange only on the selected card ring and radio; previews show each theme's hues as data",
           "selected card has filled radio plus accent ring, not colour alone",
           "one card vocabulary across the grid"]
app_dark = {"visible_affordances": (7, "unselected radios render as dark-grey filled discs with low apparent edge contrast")}
app_k = ["page surfaces match tokens; preview hues are catalog data", "contract type sizes and 8px radius cards", None,
         "accent only on selection", "same shared picker markup as DNS, Identity and Notes"]
g(("KyDNS-server", "appearance", "before", "desktop"), [8, 8, 8, 8, 8, 8], [8, 8, 7, 8, 8], app_obs,
  [app_k[0], app_k[1], dns_shell, app_k[3], app_k[4]], "settings", "appearance", "populated",
  art=["viewport 1280x900"], cav="Before and after are byte-identical; picker keyboard/radio behaviour not visible.", dark=app_dark)
g(("KyDNS-server", "appearance", "before", "mobile"), [7, 7, 6, 8, 7, 6], [8, 7, 4, 8, 6],
  [app_obs[0], app_obs[1], "header nav wraps to three rows plus a mono licence line and Sign out before the h1 (~200px)",
   app_obs[3], app_obs[4], "wrapped nav pills and footer text in header break the card page's calm"],
  [app_k[0], app_k[1], "wrapped multi-row nav in header", app_k[3], "picker matches; shell does not"],
  "settings", "appearance", "populated", art=["full-page capture 390x2003"], cav="Picker behaviour not visible.",
  dark={"visible_affordances": (6, "dark-grey unselected radios low apparent contrast; nav wraps")})
g(("KyDNS-server", "appearance", "after", "mobile"), [8, 8, 8, 8, 7, 8], [8, 8, 6, 8, 7],
  [app_obs[0], app_obs[1], "one-row header; licence moved to page foot; 2-column grid", app_obs[3],
   "tab scroller clipped at left ('ered') with no scroll cue", app_obs[5]],
  [app_k[0], app_k[1], "one-row header + horizontal tab scroller", app_k[3], app_k[4]],
  "settings", "appearance", "populated", art=["full-page capture 390x1986"], cav="Picker behaviour not visible.",
  dark={"visible_affordances": (7, "dark-grey unselected radios; tab scroller clipped at left")})

# ---------------- KyPulse ----------------
pulse_shell = "240px sidebar, wordmark, icon nav rows, account name/role pinned bottom with sign-out icon"
for surf, theme_note in (("app-detail", "Busnes OS theme"), ("app-delete-sky", "saved Sky catalog theme"), ("app-delete-forest", "saved Forest catalog theme (dark scheme even under OS light)")):
    pal_b = f"{theme_note} applied consistently except the browser-default blue/violet '← Status' link"
    pal_a = f"{theme_note} applied consistently; link now uses ink"
    tv = "monitor-detail"
    g(("KyPulse-server", surf, "before", "desktop"), [6, 6, 6, 5, 7, 5], [5, 6, 8, 7, 6],
      ["Edit and a filled Delete sit together in the page header; the danger fill is the strongest element",
       "uppercase letter-spaced fact labels (HEALTH URL); 'Down' set in mono", "settings in three boxed fact cards beside an empty Checks column",
       "browser-default underlined '← Status' link off palette; red alert bar plus red status card", "silence buttons outlined 40px; Edit outlined",
       "fact cards, card table, banner and status card mix four container styles"],
      [pal_b, "uppercase mono-ish labels against contract", pulse_shell, "orange only on selected nav; filled danger in header", "boxed fact cards unlike other Ky detail views"],
      "admin-console", tv, "sparse", art=["full-page capture 1280x911", "live timestamps", "capture-owned fake health endpoint"],
      cav="Delete confirmation not captured; contrast of named themes not measurable from pixels.")
    g(("KyPulse-server", surf, "after", "desktop"), [7, 7, 7, 6, 7, 7], [7, 7, 8, 7, 7],
      ["Edit alone in the header; Delete moved to a separate 'Stop watching' section at the foot",
       "sentence-case definition labels; mono kept for URL/reason values", "settings as a ruled definition list; full-page capture shows sidebar background ending at 900px",
       "link in ink with underline; red alert bar and red status card still dominate", "Delete is still a filled danger button (contract: outline or text)",
       "fact cards removed; ruled list and one table"],
      [pal_a, "contract label sizes", pulse_shell, "orange only on selected nav; danger fill now set apart", "detail layout now reads like Drive/Base ruled lists"],
      "admin-console", tv, "sparse", art=["full-page capture 1280x1009; sidebar background ends at 900px", "live timestamps"],
      cav="Delete confirmation not captured.")
    g(("KyPulse-server", surf, "before", "mobile"), [5, 6, 5, 5, 6, 5], [5, 6, 6, 7, 6],
      ["title shares a row with Edit and a filled Delete", "uppercase fact labels; mono 'Down'",
       "~130px alert bar before content; three stacked fact cards", "default blue/violet link; heavy red banner and card",
       "tab strip clipped at 'Logs'", "mixed containers"],
      [pal_b, "uppercase labels", "top bar with tabs; account name hidden, sign-out icon only", "orange only on selected tab", "fact cards unlike siblings"],
      "admin-console", tv, "sparse", art=["full-page capture 390x1437", "live timestamps"], cav="Delete confirmation not captured.")
    g(("KyPulse-server", surf, "after", "mobile"), [7, 7, 7, 6, 7, 7], [7, 7, 6, 7, 7],
      ["title with Edit only; Delete in a 'Stop watching' section at the foot", "sentence-case labels",
       "ruled definition list; alert bar still ~130px", "link in ink; red banner and card remain heavy",
       "Delete still filled danger; tab strip clipped at 'Logs'", "single ruled-list idiom"],
      [pal_a, "contract sizes", "top bar with tabs; account name hidden, sign-out icon only", "orange only on selected tab", "ruled list matches siblings"],
      "admin-console", tv, "sparse", art=["full-page capture 390x1524", "live timestamps"], cav="Delete confirmation not captured.")

# ---------------- KyDrive ----------------
drive_shell = "240px sidebar with wordmark, grouped nav, account name/role and sign-out icon pinned bottom"
for ph in ("before", "after"):
    g(("KyDrive-server", "files", ph, "desktop"), [8, 8, 7, 8, 8, 7], [8, 8, 8, 7, 8],
      ["h1 'My files' with one filled 'Upload files' primary in the list toolbar",
       "24px title, 15px rows, 13px meta and column headers", "three admin accordion cards stack above search and the list" + ("; 5px lower than before" if ph == "after" else ""),
       "orange on the primary, selected nav and the checked 'Open files in a new tab' box", "row overflow buttons outlined ~36px; refresh is icon-only",
       "list toolbar card plus bordered accordions: several boxed surfaces"],
      ["tokens match", "40px controls and 8px radius", drive_shell, "checked sidebar checkbox orange beyond primary/selection", "sidebar shell matches Pulse/Base/Identity"],
      "drive", "file-list", "sparse", art=["viewport 1280x900", "synthetic three text uploads"], cav="Row menus and upload flow not captured.")
    g(("KyDrive-server", "files", ph, "mobile"), [7, 7, 6 if ph == "before" else 7, 8, 7, 7], [8, 7, 6, 7, 7],
      ["h1 and full-width Upload primary", "type steps clear; 'Operations & audit' wraps beside its description",
       ("nav wraps into two rows (Settings & DB off-screen) plus checkbox and sign-out row (~200px)" if ph == "before"
        else "header compressed: one tab row with divider, remaining items scroll off right"),
       "orange on primary, selected tab and checkbox", "list actions 36px outlined", "boxed accordions and list card"],
      ["tokens match", "40px controls", "horizontal nav with no drawer; items hidden off-screen", "checkbox accent beyond primary", "tab-scroller pattern like siblings"],
      "drive", "file-list", "sparse", art=["full-page capture 390x988" if ph == "before" else "full-page capture 390x932"], cav="Hidden nav items not visible.")
g(("KyDrive-server", "settings", "before", "desktop"), [7, 7, 7, 8, 7, 6], [8, 7, 8, 7, 7],
  ["h1 'Settings'; four section cards each with their own Save", "mono 'Database' label among sans labels",
   "2x2 card grid with uneven heights", "restrained; orange on checked checkbox and selected nav",
   "native <select> 'Match system' in System card styled unlike other controls", "duplicate browser theme select inside admin Settings"],
  ["tokens match", "40px fields", drive_shell, "accent restrained", "native select unlike shared picker"],
  "settings", "admin-settings", "populated", art=["viewport 1280x900"], cav="Save outcomes not captured.")
g(("KyDrive-server", "settings", "after", "desktop"), [7, 7, 7, 8, 8, 7], [8, 7, 8, 7, 8],
  ["h1 'Settings'; four section cards each with their own Save", "mono 'Database' label remains",
   "2x2 card grid, 5px lower", "restrained", "theme select replaced by an outlined 'Open Appearance' button", "no duplicate picker; card vocabulary uniform"],
  ["tokens match", "40px fields", drive_shell, "accent restrained", "defers theme choice to Appearance like siblings"],
  "settings", "admin-settings", "populated", art=["viewport 1280x900"], cav="Appearance page itself not in this input set.")
g(("KyDrive-server", "settings", "before", "mobile"), [7, 7, 6, 8, 6, 6], [8, 7, 5, 7, 7],
  ["h1 then stacked section cards", "mono 'Database' label", "two-row nav whose second row is scrolled so 'Appearance' icon clips at left",
   "restrained", "native select; clipped nav row", "duplicate theme select"],
  ["tokens match", "40px fields", "two-row scrolling nav in header", "accent restrained", "native select unlike siblings"],
  "settings", "admin-settings", "populated", art=["full-page capture 390x1698"], cav="")
g(("KyDrive-server", "settings", "after", "mobile"), [7, 7, 7, 8, 7, 7], [8, 7, 6, 7, 8],
  ["h1 then stacked section cards", "mono 'Database' label", "one-row header; tab scroller clipped at left ('Appearance' icon)",
   "restrained", "'Open Appearance' outlined button replaces select", "uniform card vocabulary"],
  ["tokens match", "40px fields", "one-row tab scroller, no drawer", "accent restrained", "matches sibling pattern"],
  "settings", "admin-settings", "populated", art=["full-page capture 390x1646"], cav="")

# ---------------- ky-server-base ----------------
base_shell = "240px sidebar with wordmark, icon nav, Pair Device and account name/role with sign-out icon"
g(("ky-server-base", "overview", "before", "desktop"), [6, 7, 7, 7, 7, 7], [8, 7, 8, 6, 8],
  ["welcome h1; four equal cards each with a full-width outline action, no single primary",
   "17px card titles; jargon copy ('Feature 0', 'zero-CGO')", "2x2 grid, lower half empty",
   "green status chips plus orange-outlined 'sqlite (active)' chip and orange phone icon",
   "full-width outline buttons with arrows read as links", "icon tiles, chips and cards consistent"],
  ["tokens match", "40px buttons", base_shell, "orange on a status chip and Pair Device icon", "sidebar shell shared with siblings"],
  "admin-console", "base-overview", "sparse", art=["viewport 1280x900"], cav="Fresh install fixture.")
g(("ky-server-base", "overview", "after", "desktop"), [6, 7, 7, 8, 7, 7], [8, 7, 8, 7, 8],
  ["welcome h1; four equal cards, no single primary", "17px card titles; jargon copy", "2x2 grid, lower half empty",
   "'sqlite (active)' now plain ink; orange left only on Pair Device icon", "full-width outline buttons", "consistent"],
  ["tokens match", "40px buttons", base_shell, "orange only on selection and Pair Device icon", "shared shell"],
  "admin-console", "base-overview", "sparse", art=["viewport 1280x900"], cav="Fresh install fixture.")
for ph, c, a in (("before", 7, 6), ("after", 8, 7)):
    g(("ky-server-base", "overview", ph, "mobile"), [6, 7, 7, c, 6, 7], [8, 7, 6, a, 7],
      ["welcome h1; four stacked cards, no single primary", "clear steps", "even stacked cards",
       "orange-outlined sqlite chip" if ph == "before" else "sqlite chip now plain text", "tab strip clipped at 'KyBac'", "consistent"],
      ["tokens match", "40px buttons", "header with Pair Device, sign-out icon and tab scroller; no drawer", "accent restrained" if ph == "after" else "orange chip", "shared pattern"],
      "admin-console", "base-overview", "sparse", art=["full-page capture 390x1298" if ph == "before" else "full-page capture 390x1294"], cav="")
g(("ky-server-base", "settings-via-overview", "before", "desktop"), [6, 7, 6, 6, 7, 5], [7, 7, 8, 5, 6],
  ["h1 present; read-only card with no action", "label colons; mono chip", "inset bordered box inside a card",
   "orange database icon, orange-bordered mono 'sqlite' chip and green value text", "nothing interactive besides nav",
   "card-in-card plus chip plus coloured value"],
  ["green/orange decoration off role", "type fine", base_shell, "orange used as decoration", "nested box unlike siblings"],
  "settings", "admin-settings", "sparse", art=["viewport 1280x900"], cav="Read-only view.")
g(("ky-server-base", "settings-via-overview", "after", "desktop"), [7, 8, 7, 8, 7, 8], [8, 8, 8, 8, 8],
  ["h1 present; read-only definition list", "plain labels and values", "flat ruled list capped ~720px",
   "no decorative orange or green", "nothing interactive besides nav", "single ruled-list idiom"],
  ["tokens match", "contract sizes", base_shell, "accent only on selection", "ruled list matches Pulse/Drive"],
  "settings", "admin-settings", "sparse", art=["viewport 1280x900"], cav="Read-only view.")
g(("ky-server-base", "settings-via-overview", "before", "mobile"), [6, 7, 6, 6, 6, 5], [7, 7, 6, 5, 6],
  ["two-line h1; read-only card", "label colons", "inset box inside card; value wraps", "orange icon/chip, green value",
   "tab strip clipped at left", "card-in-card"],
  ["decorative hues", "type fine", "header + tab scroller", "orange decoration", "nested box unlike siblings"],
  "settings", "admin-settings", "sparse", art=["viewport 390x844"], cav="")
g(("ky-server-base", "settings-via-overview", "after", "mobile"), [7, 8, 7, 8, 6, 8], [8, 8, 6, 8, 7],
  ["two-line h1; read-only list", "plain labels", "flat ruled list", "no decorative hues", "tab strip clipped at left", "single idiom"],
  ["tokens match", "contract sizes", "header + tab scroller", "accent only on selection", "matches siblings"],
  "settings", "admin-settings", "sparse", art=["viewport 390x844"], cav="")

# ---------------- KyIdentity ----------------
idc = "Before/after use the same corrected font fixture; wordmark type change is product source, not font loading."
id_shell_b = "240px sidebar, mono wordmark with orange letter-spaced 'ID AUTHORITY' tagline, account name/role + sign-out pinned"
id_shell_a = "240px sidebar, Space Grotesk wordmark with muted tagline, account name/role + sign-out pinned"
id_mshell = "two-row horizontally scrolling nav in header, both rows clipped at the right edge; no drawer"
g(("KyIdentity-server", "applications", "before", "desktop"), [6, 6, 7, 7, 7, 7], [7, 6, 7, 6, 6],
  ["h1 'Applications'; empty state is a sentence with no link or action", "mono wordmark plus orange uppercase letter-spaced tagline",
   "even sidebar rhythm; content top-aligned", "orange tagline under the wordmark", "'Set one up' underlined link in warning banner",
   "mono wordmark/username against sans UI"],
  ["orange tagline off role", "contract sizes in content", id_shell_b, "orange tagline decorates", "mono wordmark unlike siblings"],
  "member-home", "my-applications", "empty", art=["viewport 1280x900"], cav=idc)
g(("KyIdentity-server", "applications", "after", "desktop"), [6, 7, 7, 8, 7, 8], [8, 7, 8, 8, 8],
  ["h1 'Applications'; empty state still text only", "Space Grotesk wordmark; its capital I reads close to l ('Kyldentity')",
   "even rhythm", "tagline muted ink; orange only on selection", "banner link", "one type family in the shell"],
  ["tokens match", "contract sizes", id_shell_a, "accent restrained", "wordmark style matches siblings"],
  "member-home", "my-applications", "empty", art=["viewport 1280x900"], cav=idc)
for ph, t, c, co, k in (("before", 6, 7, 6, [7, 6, 5, 6, 6]), ("after", 7, 8, 7, [8, 7, 5, 8, 7])):
    g(("KyIdentity-server", "applications", ph, "mobile"), [6, t, 6, c, 6, co], k,
      ["h1 present; text-only empty state", "mono wordmark + orange tagline" if ph == "before" else "sans wordmark, muted tagline",
       "two nav rows (~110px) before content", "orange tagline" if ph == "before" else "restrained", "nav rows clipped at right edge", "consistent below header"],
      ["tokens", "sizes", id_mshell, "accent", "shell unlike siblings"], "member-home", "my-applications", "empty", art=["viewport 390x844"], cav=idc)
g(("KyIdentity-server", "users", "before", "desktop"), [6, 6, 4, 7, 4, 6], [7, 6, 7, 6, 6],
  ["h1 'Users' with a small (~32px) filled 'Create User'", "mono account column; orange letter-spaced tagline",
   "row of eight icon-only buttons overflows the table; last header and icon clipped at the right edge",
   "orange on primary and tagline", "eight unlabeled ~28px icon buttons", "icon row chrome unlike other tables"],
  ["tokens match", "28-32px controls", id_shell_b, "tagline decorates", "icon row unlike siblings"],
  "admin-console", "user-list", "sparse", art=["viewport 1280x900"], cav=idc)
g(("KyIdentity-server", "users", "after", "desktop"), [8, 7, 8, 8, 8, 8], [8, 7, 8, 8, 8],
  ["h1 'Users' with filled 'Create User' as the only primary", "mono account column kept; sans wordmark",
   "row fits; right-aligned 'Actions' header", "restrained", "one labeled outlined 'Manage' button", "one table idiom"],
  ["tokens match", "Create User ~32px tall", id_shell_a, "accent only on primary and selection", "table matches siblings"],
  "admin-console", "user-list", "sparse", art=["viewport 1280x900"], cav=idc)
g(("KyIdentity-server", "users", "before", "mobile"), [6, 6, 3, 7, 4, 6], [7, 6, 5, 6, 6],
  ["h1 and Create User", "mono wordmark", "table clipped after Email; email truncated mid-word",
   "orange tagline", "row actions off-screen", "table chrome overflows"],
  ["tokens", "sizes", id_mshell, "tagline", "clipped table unlike siblings"], "admin-console", "user-list", "sparse", art=["viewport 390x844"], cav=idc)
g(("KyIdentity-server", "users", "after", "mobile"), [7, 7, 7, 8, 7, 7], [8, 7, 5, 8, 7],
  ["h1 and Create User", "sans wordmark", "row rendered as a stacked label/value card", "restrained", "labeled 'Manage' button", "consistent"],
  ["tokens", "sizes", id_mshell, "accent restrained", "stacked rows fit siblings"], "admin-console", "user-list", "sparse", art=["viewport 390x844"], cav=idc)
g(("KyIdentity-server", "users-manage", "after", "desktop"), [7, 7, 5, 8, 7, 6], [8, 7, 8, 8, 7],
  ["open Manage lists eight labeled actions with 'Delete user' separated below a divider",
   "consistent 15px menu rows", "menu renders inline in the row; the row stretches to ~460px and data cells centre far from the trigger",
   "danger text only on 'Delete user'", "labeled icon rows; destructive set apart", "inline panel without overlay elevation"],
  ["tokens match", "40px rows", id_shell_a, "danger text only on destructive", "menu idiom differs from overlay menus"],
  "admin-console", "user-manage", "sparse", art=["viewport 1280x900", "menu open"], cav=idc)
g(("KyIdentity-server", "users-manage", "after", "mobile"), [7, 7, 6, 8, 7, 6], [8, 7, 5, 8, 7],
  ["open Manage lists labeled actions", "consistent rows; one label wraps", "inline menu nested inside the stacked card",
   "restrained", "labeled rows", "panel inside a card"],
  ["tokens", "sizes", id_mshell, "restrained", "inline nested menu"], "admin-console", "user-manage", "sparse",
  art=["viewport 390x844", "menu open"], cav=idc + " Viewport capture: menu continues below 844px; Delete user not visible.", conf="medium")
G[("KyIdentity-server", "users-manage", "before", "desktop")] = dict(G[("KyIdentity-server", "users", "before", "desktop")], fmc=False, task_view="user-manage")
G[("KyIdentity-server", "users-manage", "before", "mobile")] = dict(G[("KyIdentity-server", "users", "before", "mobile")], fmc=False, task_view="user-manage")
g(("KyIdentity-server", "appearance", "before", "desktop"), [8, 8, 8, 7, 8, 7], [7, 7, 7, 6, 7],
  [app_obs[0], app_obs[1], app_obs[2], "orange tagline competes with the orange selected card", app_obs[4], "mono wordmark beside sans picker"],
  ["tagline off role", "contract sizes", id_shell_b, "tagline decorates", "picker shared; shell wordmark differs"],
  "settings", "appearance", "populated", art=["viewport 1280x900"], cav=idc, dark=app_dark)
g(("KyIdentity-server", "appearance", "after", "desktop"), [8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8], app_obs,
  [app_k[0], app_k[1], id_shell_a, app_k[3], app_k[4]], "settings", "appearance", "populated", art=["viewport 1280x900"], cav=idc, dark=app_dark)
g(("KyIdentity-server", "appearance", "before", "mobile"), [7, 7, 7, 7, 7, 7], [7, 7, 5, 6, 7],
  [app_obs[0], app_obs[1], "two nav rows then 2-column grid; 6 of 23 cards above the fold", "orange tagline", "nav clipped at left/right", app_obs[5]],
  ["tagline", "sizes", id_mshell, "tagline", "picker shared"], "settings", "appearance", "populated", art=["viewport 390x844"], cav=idc + " Viewport only.",
  dark={"visible_affordances": (6, "dark-grey unselected radios; nav clipped")})
g(("KyIdentity-server", "appearance", "after", "mobile"), [8, 8, 7, 8, 8, 8], [8, 8, 5, 8, 8],
  [app_obs[0], app_obs[1], "two nav rows then 2-column grid; 6 of 23 cards above the fold", "restrained", app_obs[4], app_obs[5]],
  [app_k[0], app_k[1], id_mshell, app_k[3], app_k[4]], "settings", "appearance", "populated", art=["viewport 390x844"], cav=idc + " Viewport only.",
  dark=app_dark)

# ---------------- KyNotes ----------------
nc = "Avatar initials and save times differ between runs (fixture)."
n_shell_b = "240px sidebar under a top header; uppercase section labels; account 'owner' at bottom with no role or sign-out (Lock in header)"
n_shell_a = "240px sidebar under a top header; sentence-case section labels; account 'owner' at bottom with no role or sign-out (Lock in header)"
n_mshell_b = "full-width orange 'Notebooks and account' drawer bar under the header"
n_mshell_a = "neutral 'Notebooks and account' drawer row under the header"
g(("KyNotes-server", "workspace", "before", "desktop"), [5, 6, 6, 5, 6, 5], [6, 6, 6, 4, 5],
  ["three filled-orange controls (Create recovery code, +, Create a note) compete", "uppercase FOCUS/NOTEBOOKS labels; mono 'Saved to server'",
   "irregular sidebar: bordered 'New notebook' then loose text rows with uneven gaps", "orange check, diamond and sparkle decoration; pink banner",
   "'Create recovery code' is a ~22px filled pill", "boxed button, text links and unicode glyph icons mixed"],
  ["decorative orange and pink", "small pill controls", n_shell_b, "orange used for decoration and three fills", "decorated empty state unlike siblings"],
  "notes", "notebook-list", "sparse", art=["viewport 1280x900", "random avatar initials"], cav=nc)
g(("KyNotes-server", "workspace", "after", "desktop"), [7, 7, 7, 7, 7, 7], [8, 7, 6, 8, 7],
  ["single filled 'Create a note' primary", "sentence-case labels; sans status", "sidebar rows evenly spaced",
   "neutral icons; warning callout with left rail; no sparkle", "outlined 40px recovery and + buttons",
   "unicode ✎/⇩ glyphs remain against line icons elsewhere"],
  ["tokens match", "40px controls", n_shell_a, "accent only on primary and selection", "calmer, closer to siblings"],
  "notes", "notebook-list", "sparse", art=["viewport 1280x900", "random avatar initials"], cav=nc)
for surf, cb, ab, toast in (("note", 5, 4, False), ("note-committed", 4, 3, True)):
    g(("KyNotes-server", surf, "before", "desktop"), [5, 5, 5, cb, 6, 5], [6, 5, 6, ab, 5],
      ["filled orange 'Save' in header plus filled + and recovery buttons" + (" and an orange toast" if toast else ""),
       "36px page title; note body in a different typeface (Open Sans-like)", "note body floats ~145px below the toolbar, indented ~108px",
       "orange fills and decoration throughout", "toolbar tab 'Type' selected with underline", "mixed button styles"],
      ["decorative orange", "off-family body type", n_shell_b, "orange on four elements", "editor unlike siblings"],
      "notes", "note-editor", "sparse", art=["viewport 1280x900"] + (["'Last Committed 0s ago' toast"] if toast else []), cav=nc)
    g(("KyNotes-server", surf, "after", "desktop"), [6, 6, 5, 7, 7, 6], [8, 6, 6, 8, 6],
      ["Save now outlined; no filled control besides selection" + ("; toast neutral with overlay shadow" if toast else ""),
       "36px title; note body still a different typeface", "note body still floats ~145px below the toolbar",
       "orange only on selection rails and tab underline", "outlined 40px controls", "body font and floating text remain"],
      ["tokens match", "off-family body type", n_shell_a, "accent restrained", "editor still idiosyncratic"],
      "notes", "note-editor", "sparse", art=["viewport 1280x900"] + (["toast overlay"] if toast else []), cav=nc)
    g(("KyNotes-server", surf, "before", "mobile"), [5, 6, 5, ab, 6, 5], [6, 6, 4, 3, 5],
      ["filled Save, filled + and orange drawer bar" + (" and orange toast" if toast else ""), "sans title; body in a different typeface",
       "recovery card top clipped under the tab strip at this scroll position", "large orange bar and fills", "Save pill small", "mixed"],
      ["decorative orange", "type mix", n_mshell_b, "accent everywhere", "unlike siblings"],
      "notes", "note-editor", "sparse", art=["viewport 390x844", "scrolled"] + (["toast"] if toast else []), cav=nc)
    g(("KyNotes-server", surf, "after", "mobile"), [6, 7, 6, 7, 7, 6], [8, 7, 6, 8, 6],
      ["outlined Save; no competing fills" + ("; neutral toast" if toast else ""), "body still a different typeface",
       "quick-notes list stacks above the editor; no clipped card", "restrained", "outlined 40px controls", "body font remains"],
      ["tokens match", "type mix", n_mshell_a, "restrained", "closer to siblings"],
      "notes", "note-editor", "sparse", art=["viewport 390x844"] + (["toast"] if toast else []), cav=nc)
g(("KyNotes-server", "workspace", "before", "mobile"), [5, 6, 6, 4, 6, 5], [6, 6, 4, 3, 5],
  ["filled recovery pill, sparkle and Create a note compete", "uppercase-free but mono status", "stacked panes",
   "full-width orange 'Notebooks and account' bar", "small filled pill", "mixed"],
  ["decorative orange", "small pill", n_mshell_b, "accent as decoration", "unlike siblings"], "notes", "notebook-list", "sparse", art=["viewport 390x844"], cav=nc)
g(("KyNotes-server", "workspace", "after", "mobile"), [7, 7, 7, 7, 7, 7], [8, 7, 6, 8, 7],
  ["single filled 'Create a note'", "consistent sans", "stacked panes, even spacing", "neutral drawer row; warning rail", "outlined 40px controls", "consistent"],
  ["tokens match", "40px controls", n_mshell_a, "restrained", "close to siblings"], "notes", "notebook-list", "sparse", art=["viewport 390x844"], cav=nc)
g(("KyNotes-server", "appearance", "before", "desktop"), [8, 8, 8, 8, 8, 7], [8, 8, 6, 8, 8],
  ["Settings h1 with 'Appearance' section heading and the shared picker", app_obs[1], "settings sub-nav column + 5-column grid; last row cut at fold",
   app_obs[3], app_obs[4], "mono 'Saved to server' status in header"],
  [app_k[0], app_k[1], "settings sub-navigation replaces the workspace sidebar; no account region visible", app_k[3], app_k[4]],
  "settings", "appearance", "populated", art=["viewport 1280x900"], cav=nc, dark=app_dark)
g(("KyNotes-server", "appearance", "after", "desktop"), [7, 8, 8, 8, 8, 7], [8, 8, 6, 8, 8],
  ["stray header 'Save' button on the Settings page; picker otherwise clear", app_obs[1], "same grid; toast sits against the Cyber Dark card edge",
   app_obs[3], app_obs[4], "header Save and toast carry editor state into Settings"],
  [app_k[0], app_k[1], "settings sub-navigation; no account region visible", app_k[3], app_k[4]],
  "settings", "appearance", "populated", art=["viewport 1280x900", "'Last Committed 0s ago' toast from earlier commit"], cav=nc + " Toast persisted from capture order.",
  dark=app_dark, conf="medium")
g(("KyNotes-server", "appearance", "before", "mobile"), [7, 7, 7, 8, 7, 7], [8, 7, 5, 8, 7],
  ["Settings h1 and Appearance section", app_obs[1], "header + sub-nav row then 2-column grid", app_obs[3],
   "settings tab row clipped at 'Truste'", "mono status"],
  [app_k[0], app_k[1], "top header + settings tab scroller", app_k[3], app_k[4]], "settings", "appearance", "populated",
  art=["viewport 390x844"], cav=nc + " Viewport only.", dark={"visible_affordances": (6, "dark-grey radios; tab row clipped")})
g(("KyNotes-server", "appearance", "after", "mobile"), [7, 7, 6, 8, 7, 6], [8, 7, 5, 8, 7],
  ["stray header Save on Settings", app_obs[1], "toast overlays the Light Matter and Tropics cards", app_obs[3],
   "settings tab row clipped at 'Truste'", "editor toast/Save leak into Settings"],
  [app_k[0], app_k[1], "top header + settings tab scroller", app_k[3], app_k[4]], "settings", "appearance", "populated",
  art=["viewport 390x844", "toast overlay"], cav=nc + " Viewport only; toast hides part of two cards.", conf="medium",
  dark={"visible_affordances": (6, "dark-grey radios; tab row clipped")})

# Byte-identical after capture: inherits the canonical before row (duplicate_of in output).
G[("KyDNS-server", "appearance", "after", "desktop")] = G[("KyDNS-server", "appearance", "before", "desktop")]

# ---- Post-drift re-inspection (rubric: same-image spread >= 2 resolved by re-viewing, not averaging) ----
# Applied after blind-scores.sha256 was recorded; listed in refinement-review.md "Drift".
REVISIONS = []
def revise(key, dim, val, note, why):
    s = G[key]
    if dim in K:
        i = K.index(dim); s["k"] = list(s["k"]); s["k"][i] = val; s["kobs"] = list(s["kobs"]); s["kobs"][i] = note
    else:
        i = Q.index(dim); s["q"] = list(s["q"]); s["q"][i] = val; s["obs"] = list(s["obs"]); s["obs"][i] = note
    REVISIONS.append({"group": "/".join(key), "dimension": dim, "value": val, "why": why})
for surf in ("dashboard", "appearance"):
    revise(("KyDNS-server", surf, "before", "mobile"), "shell", 5,
           "three-row wrapped nav with licence line in the header; navigation readable and reachable, no drawer",
           "re-viewed: wrapped header fights the user but nothing is clipped or unreachable, so 5 not 4")
revise(("KyDNS-server", "appearance", "before", "mobile"), "suite_cohesion", 7,
       "picker identical to siblings; only the wrapped header differs",
       "re-viewed: content area is the shared picker; header alone does not justify 6")
for surf in ("files", "settings"):
    for ph in ("before", "after"):
        for vp in ("desktop", "mobile"):
            revise(("KyDrive-server", surf, ph, vp), "accent_discipline", 8,
                   "orange on the primary, selected nav and checked checkboxes (a selected state); checkbox in sidebar foot draws the eye slightly",
                   "re-viewed: a checked checkbox is a selection state the contract allows")
