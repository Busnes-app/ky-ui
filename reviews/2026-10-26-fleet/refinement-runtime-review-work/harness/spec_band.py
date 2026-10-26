# List CSS rules setting background/color whose selector specificity is >= lo and < hi.
import re, sys
css = open(sys.argv[1]).read()
lo = tuple(int(x) for x in sys.argv[2].split(',')); hi = tuple(int(x) for x in sys.argv[3].split(','))
css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
def spec(sel):
    a=b=c=0
    def inner(s):
        best=(0,0,0)
        for part in split_commas(s):
            best=max(best,spec(part))
        return best
    i=0; s=sel
    # handle functional pseudos
    out=''
    while i < len(s):
        m = re.match(r':(not|is|has|where|matches)\(', s[i:])
        if m:
            depth=1; j=i+len(m.group(0))
            while depth and j < len(s):
                depth += {'(':1,')':-1}.get(s[j],0); j+=1
            arg=s[i+len(m.group(0)):j-1]
            if m.group(1)!='where':
                sa,sb,sc=inner(arg); a+=sa;b+=sb;c+=sc
            i=j; continue
        out+=s[i]; i+=1
    s=re.sub(r'\[[^\]]*\]', lambda m: (globals().__setitem__('_x',1) or ' .ATTR '), out)
    a+=len(re.findall(r'#[\w-]+', s))
    b+=len(re.findall(r'\.[\w-]+', s))+len(re.findall(r'(?<!:):(?!:)[\w-]+', s))
    c+=len(re.findall(r'(?:^|[\s>+~(])([a-zA-Z][\w-]*)', s))+len(re.findall(r'::[\w-]+', s))
    return (a,b,c)
def split_commas(s):
    parts=[];depth=0;cur=''
    for ch in s:
        if ch in '([': depth+=1
        if ch in ')]': depth-=1
        if ch==',' and depth==0: parts.append(cur);cur=''
        else: cur+=ch
    parts.append(cur); return [p.strip() for p in parts if p.strip()]
# walk rules (flatten @media)
for m in re.finditer(r'([^{}@]+)\{([^{}]*)\}', css):
    sels, body = m.group(1).strip(), m.group(2)
    if not re.search(r'(^|;)\s*(background(-color)?|color)\s*:', body): continue
    for sel in split_commas(sels):
        sp = spec(sel)
        if lo <= sp < hi: print(sp, sel, '{', body.strip()[:120], '}')
