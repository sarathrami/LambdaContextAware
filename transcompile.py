import subprocess
import os
import re
import sys
import hashlib

# The input src file
srcFilePath = sys.argv[1];
# Regex pattern for injecting context
regexp = r'function\s+([^(]*)\(([^,]+),\s+([^)]+)\)\s*{(\s*var\s+([^;]*);)*\n*\s*return\s+regeneratorRuntime.wrap\(';

# Use the regenerator to expose the local vars using closure
proc = subprocess.Popen(['regenerator', srcFilePath], stdout=subprocess.PIPE, stderr=subprocess.PIPE);
code, err = proc.communicate();

# Calculate the code has from pre-trans-compile
code_hash = hashlib.sha224(code).hexdigest();

# Inject context into the code
matches = re.search(regexp, code);
code_frag_to_replace = matches.group(0);
fn_name = matches.group(1);
event_param_name = matches.group(2);
context_param_name = matches.group(3);

trans_compiled_code = code.replace(code_frag_to_replace, code_frag_to_replace + context_param_name + ', ');

# Substitute all vars with context vars
try:
  code_init = '\n\n';
  var_list = matches.group(5).split(', ');
  trans_compiled_code = trans_compiled_code.replace(matches.group(4), r'// REPLACE_WITH_INITS');
  for var in var_list:
    context_var = context_param_name+'.'+var;
    trans_compiled_code = re.sub(r'([\W])'+var+r'([\W])', r'\1'+context_var+r'\2', trans_compiled_code);
    code_init += 'if(' + context_var + ' === undefined) ' + context_var + ' = undefined;\n';
  trans_compiled_code = trans_compiled_code.replace(r'// REPLACE_WITH_INITS', code_init);
except:
  pass

# Fetch the runtime code
proc = subprocess.Popen(['cat', 'src/lib/runtime.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE);
runtime_code, err = proc.communicate();

# Fetch the lambda wrapper code
proc = subprocess.Popen(['cat', 'src/lib/lambdaWrapper.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE);
lambda_wrapper_code, err = proc.communicate();

# Inject function name into lambdaWrapper
lambda_wrapper_code = 'var __transCompiledCode = ' + fn_name + ';\n' + lambda_wrapper_code;

# Inject codeHash of transcomiled into lambdaWrapper
lambda_wrapper_code = 'var __codeHash = \'' + code_hash + '\';\n' + lambda_wrapper_code;

print('\n'.join((runtime_code, trans_compiled_code, lambda_wrapper_code)));
