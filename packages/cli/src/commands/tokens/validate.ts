import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface ValidationError {
  valid: boolean;
  errors: string[];
}

export async function validateTokens(
  tokensDir: string,
): Promise<ValidationError> {
  const errors: string[] = [];
  const tokenPaths = new Map<string, string>(); // path -> filename

  // Helper to recursively validate
  function validateNode(
    node: unknown,
    currentPath: string[],
    filename: string,
  ) {
    if (typeof node !== 'object' || node === null) {
      return;
    }

    const nodeObj = node as Record<string, unknown>;

    // Check if it's a leaf node (has value)
    if ('value' in nodeObj) {
      const type = nodeObj.type;
      const fullPath = currentPath.join('.');

      // Check for missing type
      if (!type) {
        errors.push(`Missing type for token: "${fullPath}" in ${filename}`);
      }

      // Check for duplicates
      if (tokenPaths.has(fullPath)) {
        errors.push(
          `Duplicate token name: "${fullPath}" found in ${filename} (already defined in ${tokenPaths.get(fullPath)})`,
        );
      } else {
        tokenPaths.set(fullPath, filename);
      }

      // Stop recursion for this branch if it's a leaf token
      // Note: Style Dictionary allows nested groups inside a token, but usually value implies leaf.
      // If we support nested tokens inside a token (metadata?), we might continue?
      // Standard Design Tokens Format says groups and tokens. A token has a value.
      return;
    }

    // Recurse
    for (const key of Object.keys(nodeObj)) {
      if (key === '$type' || key === '$description' || key === 'description')
        continue; // Skip metadata
      validateNode(nodeObj[key], [...currentPath, key], filename);
    }
  }

  // Walk directory
  async function walk(dir: string) {
    if (!(await fs.pathExists(dir))) {
      errors.push(`Directory not found: ${dir}`);
      return;
    }

    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        // Should we recurse?
        // Style dictionary usually does `tokens/**/*.json`
        await walk(filePath);
      } else if (file.endsWith('.json')) {
        try {
          const content = await fs.readJson(filePath);
          // Initial path is based on file structure?
          // Style Dictionary default is to NOT use file path in token path unless configured.
          // But usually we just merge the objects.
          // So we should validate the OBJECT keys hierarchy.
          validateNode(content, [], file);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push(`Invalid JSON in ${file}: ${message}`);
        }
      }
    }
  }

  await walk(tokensDir);

  if (errors.length > 0) {
    console.error(chalk.red('Token validation failed:'));
    errors.forEach((e) => console.error(chalk.red(`- ${e}`)));
    return { valid: false, errors };
  }

  console.log(chalk.green('Token validation passed!'));
  return { valid: true, errors: [] };
}
