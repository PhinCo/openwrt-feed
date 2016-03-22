#include <ble/hci_bridge.h>
#include <ble/ble.h>
#include <stdlib.h>
#include <stdio.h>
#include <memory.h>
#include <unistd.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <time.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <ble/ecdh.h>
#include <pthread.h>
#include <ble/encryption.h>


// Global variables
static int sPort = 0;
pthread_t sServerThread = 0;
int sListenFd = 0;
int sClientFd = 0;

static KeyPair *kp = NULL;
static size_t secretLength;
static unsigned char *secret;

static pthread_mutex_t socketLock = PTHREAD_MUTEX_INITIALIZER;

static void reportStatus(u8 status, u8 subcommand, u8 *data, u16 length) {
	int size = 2;

	if (data != NULL) {
		size += length;
	}	

	u8 *buf = (u8 *) malloc(sizeof(u8) * size);
	if (buf == NULL) {
		printf("Unable to allocate memory in reportStatus\n");
		return;
	}
	buf[0] = status;
	buf[1] = subcommand;

	if (data != NULL) {
		memcpy(buf + 2, data, length); 
	}

	hci_bridge_send(PLAYGROUND_INTERNAL_COMMAND, buf, size);
	free(buf);
}

static void handleInternalCommand(u8 *buffer, u16 length) {
	if (length < 1) {
		reportStatus(ERROR, ERROR, NULL, 0);
		return;
	}

	u8 command = buffer[0];
	buffer++;
	length--;

	switch (command) {
		case PG_CREATE_KEY_PAIR: {
			printf("Creating key pair\n");
			if (kp == NULL)	{
				kp = (KeyPair *) malloc(sizeof(KeyPair));

				if (generateKeyPair(kp)) {
					free(kp);
					printf("Error generating key pair\n");
					reportStatus(ERROR, PG_CREATE_KEY_PAIR, NULL, 0);
					return;
				}
			}
			reportStatus(HCI_BRIDGE_OK, PG_CREATE_KEY_PAIR, kp->public, kp->publicLength);
			break;
		}
		case PG_GET_PUB_KEY: {
			printf("Requesting public key\n");
			if (kp == NULL) {
				reportStatus(ERROR, PG_GET_PUB_KEY, NULL, 0);
				return;
			}
			reportStatus(HCI_BRIDGE_OK, PG_GET_PUB_KEY, kp->public, kp->publicLength);
			break;
		}
		case PG_DERIVE_SECRET: {
			u16 peerPubKeyLength;

            if (length < sizeof(u16)) {
				printf("Error reading peer's pub key length\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_DERIVE_SECRET, NULL, 0);
                break;
			}

			peerPubKeyLength = buffer[0] << 8 | buffer[1];
			buffer += 2;
			length -= 2;

			int j = 0;
			for (; j < peerPubKeyLength; j++) {
				printf("%c", buffer[j]);
			}
			printf("\n");


			if (length != peerPubKeyLength) {
				printf("Invalid peer's pub key size\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_DERIVE_SECRET, NULL, 0);
                break;
			}

			secret = deriveSecret(kp->private, buffer, peerPubKeyLength, &secretLength);
			reportStatus(HCI_BRIDGE_OK, PG_DERIVE_SECRET, NULL, 0);
			break;
		}
		case PG_AES_DECRYPT: {
			if (secret == NULL) {
				printf("Trying to decrypt without a secret\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_AES_DECRYPT, NULL, 0);
				break;
			}

			u16 dataLength;

            if (length < sizeof(u16)) {
				printf("Error reading decrypt data\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_AES_DECRYPT, NULL, 0);
                break;
			}

			dataLength = buffer[0] << 8 | buffer[1];
			buffer += 2;
			length -= 2;

			if (length != dataLength) {
				printf("Invalid decrypt data size\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_AES_DECRYPT, NULL, 0);
                break;
			}

			u8 decrypted[4096];
			int size = encryption_decrypt(buffer, dataLength, secret, NULL, decrypted);

			reportStatus(HCI_BRIDGE_OK, PG_AES_DECRYPT, decrypted, size);
			break;
		}
		case PG_AES_ENCRYPT: {
			reportStatus(HCI_BRIDGE_ERROR, PG_AES_ENCRYPT, NULL, 0);
			break;
		}	
		case PG_PUBLIC_DECRYPT: {
			// We actually don't need this total data length, so we simply skip it.
			u16 totalDataLength;
            if (length < sizeof(u16)) {
				printf("Error reading total data length\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_PUBLIC_DECRYPT, NULL, 0);
                break;
			}
			buffer += 2;
			length -= 2;

			u16 pubKeyLength;
            if (length < sizeof(u16)) {
				printf("Error reading peer's pub key length\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_PUBLIC_DECRYPT, NULL, 0);
                break;
			}

			pubKeyLength = buffer[0] << 8 | buffer[1];
			buffer += 2;
			length -= 2;

			if (length <= pubKeyLength) {
				printf("Invalid peer's pub key size\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_PUBLIC_DECRYPT, NULL, 0);
                break;
			}

			unsigned char *pubKey = (unsigned char *) malloc(sizeof(unsigned char) * pubKeyLength);
			memcpy(pubKey, buffer, pubKeyLength);

			buffer += pubKeyLength;
			length -= pubKeyLength;

			u16 dataLength;

            if (length < sizeof(u16)) {
				printf("Error reading decrypt data\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_PUBLIC_DECRYPT, NULL, 0);
                break;
			}

			dataLength = buffer[0] << 8 | buffer[1];
			buffer += 2;
			length -= 2;
			if (length != dataLength) {
				printf("Invalid decrypt data size\n");
				reportStatus(HCI_BRIDGE_ERROR, PG_PUBLIC_DECRYPT, NULL, 0);
                break;
			}
			u8 decrypted[4096];
			int size = encryption_decryptWithPublicKey(buffer, dataLength, pubKey, decrypted);
			free(pubKey);
			if (size == -1) {
				reportStatus(HCI_BRIDGE_ERROR, PG_PUBLIC_DECRYPT, NULL, 0);
			} else {
				reportStatus(HCI_BRIDGE_OK, PG_PUBLIC_DECRYPT, decrypted, size);
			}
			break;
		}
		case PG_INTERNAL_STATUS: {
			u16 size = queueSize();
			char buffer[1024];
			sprintf(buffer, "{\"queueSize\":%d}", size);
			reportStatus(HCI_BRIDGE_OK, PG_INTERNAL_STATUS, buffer, strlen(buffer));
			break;
		}		
		default:
			reportStatus(HCI_BRIDGE_ERROR, ERROR, NULL, 0);
			return;
	}
}

static void session() {
	int timeout_ms = 25;
    uint8_t *buf;
	uint8_t commandType;

	int i;

	for (;;) {
	    struct timeval tv;
        tv.tv_sec = timeout_ms/1000;
        tv.tv_usec = (timeout_ms % 1000)*1000;
        fd_set fds;
        FD_ZERO(&fds);
        FD_SET(sClientFd, &fds);
        int maxfd = sClientFd;
        int s = select( maxfd + 1 , &fds , NULL , NULL , /*&tv*/NULL);

        if (s < 0)
            break;
	
        if (FD_ISSET(sClientFd,&fds)) {
			// Receive length
			u16 length;
            int n = recv(sClientFd, &length, sizeof(u16), 0);			

			if (n < sizeof(u16)) {
				printf("ERROR RECEIVING LENGTH: %d\n", n);
				break;
			}			

			if (length > 4096) {
				printf("Received a message longer than 4096");
				break;
			}

			// length - 1 because we include the commandType, which we don't need to 
			// use later
			// The queue where we put the data is responsible for deallocating the data
			buf = (uint8_t *) malloc(sizeof(uint8_t) * (length - 1));

			// First byte is the type of command: HCI_CMD, HCI_DATA, HCI_EVT
			n = recv(sClientFd, &commandType, 1, 0);
            if (n <= 0) {
				printf("Error reading from client the commandType\n");
                break;
			}

            n = recv(sClientFd, buf, length - 1, 0);

            if (n <= 0 || n != length - 1) {
				printf("Error reading from client the main payload\n");
                break;
			}

			int channel = 0;
			if (commandType == HCI_COMMAND) channel = 5;
			else if (commandType == HCI_DATA) channel = 6;
			else if (commandType == HCI_EVENT) channel = 5;
			else if (commandType == PLAYGROUND_INTERNAL_COMMAND) {
				handleInternalCommand(buf, length - 1);
			} else {
				printf("Invalid command type: %d\n", commandType);
				continue;
			}

			if (channel == 5 || channel == 6) {
				printf("Queue Command\n");
				queue_hci_op(buf, length - 1, channel);
			}
        }
    }
}

int setupServerSocket() {
    struct sockaddr_in servaddr = {0};

    sListenFd = socket(AF_INET,SOCK_STREAM,0);
    int optval = 1;
    setsockopt(sListenFd, SOL_SOCKET, SO_REUSEADDR,(const void *)&optval , sizeof(int));

    servaddr.sin_family = AF_INET;
    servaddr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
    servaddr.sin_port = htons(sPort);

    if (bind(sListenFd,(struct sockaddr *)&servaddr,sizeof(servaddr))) {
        printf("bind failed\n");
		return ERROR;
	}

    if (listen(sListenFd,1)) {
        printf("listen failed\n");
		return ERROR;
	}
}

static void hci_bridge_start_internal() {
    struct sockaddr_in clientaddr;

    for(;;) {
		printf("hci_server listening on port %d...\n", sPort);
        socklen_t len = sizeof(clientaddr);
        int s = accept(sListenFd,(struct sockaddr *) &clientaddr,&len);

        if (s == -1)
            break;

        //setsockopt(s, SOL_SOCKET, SO_NOSIGPIPE, (const void *)&optval , sizeof(int));

        printf("Connection from %s\n", inet_ntoa(clientaddr.sin_addr));
		sClientFd = s;

		// Close the socket so if a client tries to connect we refuse the connection
		close(sListenFd);
        session();
        close(s);
        printf("Disconnecting from %s\n", inet_ntoa(clientaddr.sin_addr));

		// Listen again
		if (setupServerSocket() != OK) {
			printf("Error setting up the server socket\n");
			return;
		}
	}
}

// Puts the data on a socket using the following encoding:
// 2 bytes: size
// 1 byte:  commandType (HCI_EVENT, HCI_DATA)
// n bytes: payload
int hci_bridge_send(u8 commandType, u8 *data, u16 length) {
	if (sClientFd == 0) {
		return ERROR;
	}
	int newLength = length + 2 /*size*/ + 1 /*command type*/;

	u8 *newData = (u8 *) malloc(sizeof(u8) * (newLength));

	u16 newOrderLength = htons(length + 1);

	
	// Length includes the commandType (1 byte) but not the 2 bytes for the length.
	newData[0] = (newOrderLength) >> 8;
	newData[1] = (newOrderLength);
	newData[2] = commandType;
	memcpy(newData + 3, data, length);
	int sent = send(sClientFd, newData, newLength, 0);

	free(newData);

	if (sent == newLength) {
		return OK;
	} else {
		printf("Error sending payload\n");
		return ERROR;
	}
}

int hci_bridge_start(int port) {
	if (sServerThread != 0) {
		return OK;
	}

	sPort = port;

	if (setupServerSocket() != OK) {
		return ERROR;
	}

	if (pthread_create (&sServerThread, NULL, (void *) hci_bridge_start_internal, NULL) == 0) {
		return OK;
	} else {
		return ERROR;
	}
}
