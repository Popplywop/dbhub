import { ConnectorManager } from '../connectors/manager.js';
import { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import { createResourceSuccessResponse, createResourceErrorResponse } from '../utils/response-formatter.js';

/**
 * Schema resource handler
 * Returns schema information for a specific table
 */
export async function schemaResourceHandler(uri: URL, variables: Variables, _extra: any) {
  const connector = ConnectorManager.getCurrentConnector();
  // Handle tableName which could be a string or string array from URL template
  const tableName = Array.isArray(variables.tableName) 
    ? variables.tableName[0] 
    : variables.tableName as string;
  
  try {
    // If table doesn't exist, getTableSchema will throw an error
    const columns = await connector.getTableSchema(tableName);
    
    // Create a more structured response
    const formattedColumns = columns.map(col => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      default: col.column_default
    }));
    
    // Prepare response data
    const responseData = {
      table: tableName,
      columns: formattedColumns,
      count: formattedColumns.length
    };
    
    // Use the utility to create a standardized response
    return createResourceSuccessResponse(uri.href, responseData);
  } catch (error) {
    // Use the utility to create a standardized error response
    return createResourceErrorResponse(
      uri.href,
      `Table '${tableName}' does not exist or cannot be accessed`,
      "TABLE_NOT_FOUND"
    );
  }
}