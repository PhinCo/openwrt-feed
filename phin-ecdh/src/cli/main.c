//
//  main.c
//  phin-ecdh
//
//  Created by Scott Eklund on 8/15/18.
//  Copyright © 2018 Scott Eklund. All rights reserved.
//

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include "commands.h"

void help(void){
    printf("phin-ecdh <command> <inputs...>\n\n");
    printf("commands are:\n");
    printf("  gen     <public-pem-file> <private-pem-file>\n");
    printf("  derive  <public-pem-file> <private-pem-file> <peer-public-pem-file> <secret-hex-file>\n");
    printf("  encrypt <secret-hex-file> <in-hex-file> <out-hex-file>\n");
    printf("  decrypt <secret-hex-file> <in-hex-file> <out-hex-file>\n");
    printf("\n");
}



int main(int argc, const char * argv[]) {
    
    if( argc < 2 ){
        help();
        return -1;
    }

    const char *command = argv[1];
    
    if( strcmp( command, "gen" ) == 0){
        if( argc < 4){
            help();
            return 1;
        }
        command_generate( argv[2], argv[3]);
        
    }else if( strcmp( command, "derive" ) == 0 ){
        if( argc < 6){
            help();
            return 1;
        }
        command_derive( argv[2], argv[3], argv[4], argv[5] );
        
    }else if ( strcmp( command, "encrypt" ) == 0 ){
        if( argc < 5){
            help();
            return 1;
        }
        command_encrypt( argv[2], argv[3], argv[4] );
        
    }else if ( strcmp( command, "decrypt" ) == 0 ){
        if( argc < 5){
            help();
            return 1;
        }
        command_decrypt( argv[2], argv[3], argv[4] );
        
    }else{
        printf("Unknown command: %s\n", command );
        return 1;
    }
    
    return 0;
}

